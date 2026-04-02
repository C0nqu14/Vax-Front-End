import { useEffect, useState } from "react";
import { 
  Search, 
  MapPin, 
  Clock,
  Filter,
  ArrowRight,
  Navigation,
  Loader2,
  AlertCircle,
  TrendingUp,
  Target
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../services/api";
import { supabase } from "../services/supabase";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { normalizarCategoria } from "../constants";

export const ExplorePage = () => {
  const [campanhas, setCampanhas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [geoLoading, setGeoLoading] = useState(false);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [locationError, setLocationError] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<PermissionState | "unknown">("unknown");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    minValue: "",
    maxValue: "",
    status: ""
  });

  const fetchData = async (params = {}) => {
    try {
      setLoading(true);
      let campaignsData: any[] = [];
      let source = "unknown";

      try {
        const response = await api.get("/campanhas", { params });
        campaignsData = response.data || [];
        source = "API";
        console.log("")
      } catch (apiError) {
        console.warn("⚠ API /campanhas falhou. Fallback Supabase.", apiError);
        const { data, error } = await supabase
          .from("campanhas")
          .select("*")
          .order("data_criacao", { ascending: false });
        if (error) throw error;
        campaignsData = data || [];
        source = "Supabase";
        console.log("Dados do Supabase (RAW):", campaignsData);
        console.log("Primeiro item (raw):", JSON.stringify(campaignsData[0], null, 2));
        console.log("Campo categoria do primeiro:", campaignsData[0]?.categoria);
        console.log("Todos os campos do primeiro:", Object.keys(campaignsData[0] || {}));
      }

      const processedCampanhas = campaignsData.map((c: any) => {
        const normalized = normalizarCategoria(c.categoria || c.category || c.tipo || c.type);
        console.log(`Campanha: "${c.titulo}" | Raw: ${c.categoria || c.category || c.tipo || c.type || "NULL"} | Normalizada: ${normalized}`);
        return { ...c, categoria: normalized };
      });
      
      console.log(`Campanhas processadas (fonte: ${source}):`, processedCampanhas);
      setCampanhas(processedCampanhas);
    } catch (err) {
      console.error("Erro ao carregar campanhas reais ou do Supabase", err);
      setCampanhas([]);
    } finally {
      setLoading(false);
    }
  };

  const checkPermission = async () => {
    if ("permissions" in navigator) {
      try {
        const result = await navigator.permissions.query({ name: "geolocation" as PermissionName });
        setPermissionStatus(result.state);
        result.onchange = () => setPermissionStatus(result.state);
      } catch (err) {
        console.error("Erro ao verificar permissões:", err);
      }
    }
  };

  useEffect(() => {
    fetchData();
    checkPermission();
  }, []);

  const handleNearbySearch = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocalização não suportada no seu navegador.");
      return;
    }

    setGeoLoading(true);
    setLocationError(null);

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          let response;
          try {
            response = await api.get(`/campanhas/proximos/${latitude}/${longitude}`, {
              params: { raio: 15 }
            });
          } catch (fallbackError) {
            response = await api.get("/campanhas/proximas", {
              params: { lat: latitude, lng: longitude, raio: 15 }
            });
          }

          setCampanhas((response.data || []).map((c: any) => ({ ...c, categoria: normalizarCategoria(c.categoria || c.category || c.tipo || c.type) })));
          setFilter("nearby");
          setPermissionStatus("granted");
        } catch (err) {
          console.error("Erro na busca ST_Distance", err);
          setLocationError("Nenhuma causa ativa de impacto encontrada próxima a si.");
        } finally {
          setGeoLoading(false);
        }
      },
      (error) => {
        setGeoLoading(false);
        if (error.code === error.PERMISSION_DENIED) {
          setPermissionStatus("denied");
          setLocationError("Acesso à localização bloqueado. Por favor, ative nas definições do navegador para encontrar causas perto de você.");
        } else {
          setLocationError("Não foi possível obter sua localização. Tente novamente.");
        }
      },
      options
    );
  };

  const categories = [
    { id: "all", label: "Tudo" }
  ];

  const aplicarFiltros = () => {
    let filtered = campanhas;

    if (searchTerm) {
      filtered = filtered.filter(c =>
        (c.titulo?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (c.descricao?.toLowerCase() || "").includes(searchTerm.toLowerCase())
      );
    }

    if (advancedFilters.minValue) {
      filtered = filtered.filter(c => c.valor_meta >= parseFloat(advancedFilters.minValue));
    }
    if (advancedFilters.maxValue) {
      filtered = filtered.filter(c => c.valor_meta <= parseFloat(advancedFilters.maxValue));
    }
    if (advancedFilters.status) {
      filtered = filtered.filter(c => c.estado === advancedFilters.status);
    }

    return filtered;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 py-24 px-6 md:px-12 lg:px-24">
      {/* Header */}
      <header className="max-w-7xl mx-auto text-center mb-32">
        <div className="flex items-center gap-3 justify-center">
          
        </div>
        <h1 className="text-6xl md:text-7xl font-bold text-vax-primary tracking-tighter leading-[0.9]">Transforme a sua comunidade.</h1>
        <p className="text-slate-500 text-2xl font-medium leading-relaxed max-w-2xl mx-auto">Descubra projetos reais validados pelo NIF e apoie o impacto local.</p>
      </header>

      {/* Interface de Filtros de Segurança & Busca */}
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-10">
          <div className="flex flex-wrap items-center gap-4 p-2 bg-vax-input rounded-[32px] border border-vax-border w-fit shadow-inner">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => { setFilter(cat.id); fetchData({}); }}
                className={`px-8 py-3.5 text-xs font-black rounded-[24px] uppercase tracking-widest transition-all flex items-center gap-2 ${
                  filter === cat.id 
                    ? "bg-white text-vax-primary shadow-xl scale-[1.05]" 
                    : "text-slate-400 hover:text-vax-primary"
                }`}
              >
                {cat.label}
              </button>
            ))}
            <div className="w-px h-8 bg-vax-border mx-2 hidden md:block" />
            <button
              onClick={handleNearbySearch}
              disabled={geoLoading}
              className={`px-8 py-3.5 text-xs font-black rounded-[24px] uppercase tracking-widest transition-all flex items-center gap-3 ${
                filter === "nearby" 
                  ? "bg-vax-primary text-white shadow-2xl shadow-vax-primary/30" 
                  : "text-slate-400 hover:text-vax-primary bg-white/40"
              }`}
            >
              {geoLoading ? <Loader2 className="w-4 h-4 animate-spin text-vax-primary" /> : <Navigation className={`w-4 h-4 ${filter === 'nearby' ? 'text-white' : 'text-vax-primary'}`} />}
              Próximas a mim
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6 w-full xl:w-auto">
             <div className="relative group w-full sm:min-w-[450px]">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-vax-primary transition-colors" />
                <input 
                  type="text"
                  placeholder="Pesquisar causas reais..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white border-2 border-vax-border/50 rounded-[30px] pl-16 pr-8 py-5 text-base outline-none focus:border-vax-primary transition-all shadow-xl placeholder:text-slate-300 font-bold tracking-tight"
                />
             </div>
             <Button variant="outline" className="bg-white rounded-full px-8 h-16 border-vax-border/50 shadow-xl" leftIcon={<Filter className="w-5 h-5" />} onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}>
                Filtros Avançados
             </Button>
          </div>
        </div>

        {/* Filtros Avançados Modal */}
        <AnimatePresence>
          {showAdvancedFilters && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white border border-vax-border rounded-[32px] p-8 shadow-2xl overflow-hidden mt-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <label className="text-sm font-bold text-vax-primary mb-2 block">Valor Mínimo</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={advancedFilters.minValue}
                    onChange={(e) => setAdvancedFilters({...advancedFilters, minValue: e.target.value})}
                    className="w-full bg-vax-input rounded-xl p-3 border border-vax-border focus:border-vax-primary outline-none"
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-vax-primary mb-2 block">Valor Máximo</label>
                  <input
                    type="number"
                    placeholder="100000"
                    value={advancedFilters.maxValue}
                    onChange={(e) => setAdvancedFilters({...advancedFilters, maxValue: e.target.value})}
                    className="w-full bg-vax-input rounded-xl p-3 border border-vax-border focus:border-vax-primary outline-none"
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-vax-primary mb-2 block">Status</label>
                  <select
                    value={advancedFilters.status}
                    onChange={(e) => setAdvancedFilters({...advancedFilters, status: e.target.value})}
                    className="w-full bg-vax-input rounded-xl p-3 border border-vax-border focus:border-vax-primary outline-none"
                  >
                    <option value="">Todos</option>
                    <option value="ativa">Ativa</option>
                    <option value="concluida">Concluída</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-4 mt-6">
                <Button variant="outline" onClick={() => {
                  setAdvancedFilters({minValue: "", maxValue: "", status: ""});
                }}>
                  Limpar Filtros
                </Button>
                <Button onClick={() => setShowAdvancedFilters(false)}>
                  Fechar
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {locationError && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="p-8 bg-vax-error-light/20 border-2 border-vax-error-DEFAULT/10 rounded-[40px] flex flex-col md:flex-row items-center gap-6 text-vax-error-DEFAULT shadow-xl mt-8">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg">
                <AlertCircle className="w-8 h-8" />
              </div>
              <div className="flex-1 text-center md:text-left space-y-1">
                 <p className="text-sm font-black uppercase tracking-widest">{locationError}</p>
                 {permissionStatus === 'denied' && (
                   <p className="text-[10px] font-bold opacity-60 uppercase tracking-tight">Vá às definições do navegador (cadeado na barra de endereço) e limpe a permissão de localização.</p>
                 )}
              </div>
              {permissionStatus === 'denied' && (
                <Button variant="outline" className="bg-white border-vax-error-DEFAULT/20 text-vax-error-DEFAULT hover:bg-vax-error-DEFAULT hover:text-white px-8 h-12 rounded-full font-black text-[10px] uppercase tracking-widest" onClick={() => window.open('https://support.google.com/chrome/answer/142065', '_blank')}>
                  Instruções
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Grid de Campanhas Reais */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 pt-20">
             {[...Array(6)].map((_, i) => (
               <div key={i} className="h-[550px] bg-vax-input/30 rounded-[60px] animate-pulse border border-vax-border/50" />
             ))}
          </div>
        ) : (
          (() => {
            const filteredCampanhas = aplicarFiltros();
            return filteredCampanhas.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 pt-20">
                {filteredCampanhas.map((c) => (
                  <CampaignItem key={c.id} campaign={c} />
                ))}
              </div>
            ) : (
              <div className="text-center py-40 space-y-10 bg-vax-input/10 rounded-[80px] border-4 border-dashed border-vax-border pt-20">
                 <div className="w-24 h-24 bg-white rounded-[32px] flex items-center justify-center mx-auto shadow-3xl">
                   <Search className="w-10 h-10 text-slate-200" />
                 </div>
                 <div className="space-y-4">
                    <h3 className="text-4xl font-bold text-vax-primary tracking-tighter">Causa não encontrada</h3>
                    <p className="text-slate-500 font-medium max-w-md mx-auto text-lg leading-relaxed">Não existem campanhas ativas com estes critérios. Tente redefinir os filtros ou remover a pesquisa.</p>
                 </div>
                 <Button variant="outline" onClick={() => { setSearchTerm(""); fetchData(); setFilter("all"); }} className="bg-white px-10 h-14 rounded-full font-black text-xs uppercase tracking-widest">Mostrar Tudo</Button>
              </div>
            );
          })()
        )}
      </div>
    </div>
  );
};

const CampaignItem = ({ campaign }: any) => {
  const percentage = Math.min((campaign.valor_arrecadado / campaign.valor_meta) * 100, 100);
  const daysLeft = Math.max(0, Math.ceil((new Date(campaign.data_fim).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
  
  console.log(` CampaignItem renderizado: "${campaign.titulo}" | categoria: ${campaign.categoria}`);

  return (
    <Card className="group h-[560px] w-full flex flex-col border border-slate-100 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 rounded-2xl overflow-hidden bg-white">
  {/* Imagem - 40% altura */}
  <div className="h-72 relative">
    <img 
      src={campaign.imagem_url || "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?auto=format&fit=crop&w=800&q=80"} 
      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
      alt={campaign.titulo}
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
    <div className="absolute top-4 left-4 right-4 flex gap-2">
      <Badge className="flex-1 bg-white/95 backdrop-blur text-vax-primary shadow-xl px-3 py-2 text-xs font-black uppercase tracking-wide rounded-lg">
        {campaign.categoria || "Social"}
      </Badge>
      {campaign.distancia_formatada && (
        <Badge className="bg-vax-primary/95 text-white shadow-xl px-3 py-2 text-xs font-black uppercase tracking-wide rounded-lg flex items-center gap-1">
          <Navigation className="w-3.5 h-3.5" /> {campaign.distancia_formatada}
        </Badge>
      )}
    </div>
  </div>
  
  {/* Conteúdo - 60% altura */}
  <div className="flex-1 p-5 flex flex-col">
    {/* Info */}
    <div className="mb-4 space-y-2 flex-1">
      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wide">
        <MapPin className="w-3 h-3 text-vax-primary" />
        Cazenga, Luanda
      </div>
      <h3 className="text-lg font-bold text-gray-900 leading-snug line-clamp-2">
        {campaign.titulo}
      </h3>
      <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
        {campaign.descricao}
      </p>
    </div>
    
    {/* Stats + Progress */}
    <div className="space-y-3">
      <div className="flex justify-between items-end gap-2 pb-1">
        <div className="space-y-0.5">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wide block">Arrecadado</span>
          <span className="text-xl font-bold text-gray-900">
            {Number(campaign.valor_arrecadado).toLocaleString()}
            <span className="text-xs text-slate-500 ml-1">KZ</span>
          </span>
        </div>
        <div className="text-right min-w-[60px]">
          <span className="text-xs font-bold text-vax-primary block">{Math.floor(percentage)}%</span>
          <span className="text-xs text-slate-500">meta</span>
        </div>
      </div>
      
      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden shadow-sm">
        <motion.div 
          className={`h-full rounded-full shadow-sm ${percentage >= 100 ? 'bg-emerald-500' : 'bg-vax-primary'}`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8 }}
        />
      </div>
    </div>
    
    {/* Footer */}
    <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-100">
      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wide">
        <Clock className="w-3 h-3 text-vax-primary" />
        {daysLeft} dias
      </div>
      <Link to={`/campanhas/${campaign.id}`}>
        <Button className="h-9 px-4 text-xs font-bold uppercase tracking-wide bg-vax-primary hover:bg-vax-primary/90 text-white shadow-md hover:shadow-lg rounded-lg transition-all">
          Apoiar <ArrowRight className="w-3.5 h-3.5 ml-1 inline group-hover:translate-x-1" />
        </Button>
      </Link>
    </div>
  </div>
</Card>
  );
};