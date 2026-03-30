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
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";

export const ExplorePage = () => {
  const [campanhas, setCampanhas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [geoLoading, setGeoLoading] = useState(false);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [locationError, setLocationError] = useState<string | null>(null);

  const fetchData = async (params = {}) => {
    try {
      setLoading(true);
      // Alinhado com a busca global SQL (select * from campanhas where estado = 'ativa')
      const response = await api.get("/campanhas", { params });
      setCampanhas(response.data || []);
    } catch (err) {
      console.error("Erro ao carregar campanhas reais");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleNearbySearch = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocalização não suportada no seu navegador.");
      return;
    }

    setGeoLoading(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Chamada dinâmica ao endpoint que utiliza a função SQL projetos_proximos(lat, lng)
          const response = await api.get("/campanhas/proximas", {
            params: { lat: latitude, lng: longitude, raio_km: 10 }
          });
          setCampanhas(response.data || []);
          setFilter("nearby");
        } catch (err) {
          console.error("Erro na busca ST_Distance");
          setLocationError("Nenhuma causa ativa de impacto encontrada próxima a si.");
        } finally {
          setGeoLoading(false);
        }
      },
      (error) => {
        setGeoLoading(false);
        setLocationError("Ative a localização para encontrar causas perto de você.");
      }
    );
  };

  const categories = [
    { id: "all", label: "Tudo" },
    { id: "social", label: "Social" },
    { id: "saúde", label: "Saúde" },
  ];

  const filteredCampanhas = campanhas.filter(c => 
    (c.titulo?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (c.descricao?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-12 animate-in fade-in duration-1000 pb-20 mt-10">
      <header className="max-w-4xl space-y-6">
        <div className="flex items-center gap-3">
           <Badge variant="info" className="bg-vax-primary text-white border-none px-5 py-2 font-black tracking-widest text-[10px] uppercase shadow-lg shadow-vax-primary/20">REDE CAZENGA</Badge>
           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sincronizado via SQL</span>
        </div>
        <h1 className="text-6xl md:text-7xl font-bold text-vax-primary tracking-tighter leading-[0.9]">Transforme a sua comunidade.</h1>
        <p className="text-slate-500 text-2xl font-medium leading-relaxed max-w-2xl">Descubra projetos reais validados pelo NIF e apoie o impacto local.</p>
      </header>

      {/* Interface de Filtros de Segurança & Busca */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-10">
        <div className="flex flex-wrap items-center gap-4 p-2 bg-vax-input rounded-[32px] border border-vax-border w-fit shadow-inner">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => { setFilter(cat.id); fetchData(cat.id !== 'all' ? { categoria: cat.label } : {}); }}
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
           <Button variant="outline" className="bg-white rounded-full px-8 h-16 border-vax-border/50 shadow-xl" leftIcon={<Filter className="w-5 h-5" />}>
              Filtros Avançados
           </Button>
        </div>
      </div>

      <AnimatePresence>
        {locationError && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="p-6 bg-vax-error-light/30 border-2 border-vax-error-DEFAULT/10 rounded-[30px] flex items-center gap-4 text-vax-error-DEFAULT text-sm font-black uppercase tracking-widest">
            <AlertCircle className="w-6 h-6" /> {locationError}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid de Campanhas Reais */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
           {[...Array(6)].map((_, i) => (
             <div key={i} className="h-[550px] bg-vax-input/30 rounded-[60px] animate-pulse border border-vax-border/50" />
           ))}
        </div>
      ) : filteredCampanhas.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {filteredCampanhas.map((c) => (
            <CampaignItem key={c.id} campaign={c} />
          ))}
        </div>
      ) : (
        <div className="text-center py-40 space-y-10 bg-vax-input/10 rounded-[80px] border-4 border-dashed border-vax-border">
           <div className="w-24 h-24 bg-white rounded-[32px] flex items-center justify-center mx-auto shadow-3xl">
             <Search className="w-10 h-10 text-slate-200" />
           </div>
           <div className="space-y-4">
              <h3 className="text-4xl font-bold text-vax-primary tracking-tighter">Causa não encontrada</h3>
              <p className="text-slate-500 font-medium max-w-md mx-auto text-lg leading-relaxed">Não existem campanhas ativas com estes critérios. Tente redefinir os filtros ou remover a pesquisa.</p>
           </div>
           <Button variant="outline" onClick={() => { setSearchTerm(""); fetchData(); setFilter("all"); }} className="bg-white px-10 h-14 rounded-full font-black text-xs uppercase tracking-widest">Mostrar Tudo</Button>
        </div>
      )}
    </div>
  );
};

const CampaignItem = ({ campaign }: any) => {
  const percentage = Math.min((campaign.valor_arrecadado / campaign.valor_meta) * 100, 100);
  const daysLeft = Math.max(0, Math.ceil((new Date(campaign.data_fim).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

  return (
    <Card className="flex flex-col group h-full border-vax-border shadow-vax hover:shadow-3xl hover:translate-y-[-12px] transition-all duration-1000 rounded-[60px] overflow-hidden bg-white relative">
      <div className="h-64 relative overflow-hidden shrink-0">
        <img 
          src={campaign.imagem_url || "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?auto=format&fit=crop&q=80"} 
          className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-125"
          alt={campaign.titulo}
        />
        <div className="absolute top-8 left-8 flex gap-3">
           <Badge className="bg-white/95 backdrop-blur text-vax-primary border-none shadow-2xl font-black uppercase tracking-[0.2em] px-6 py-2.5 text-[9px] rounded-full">
             {campaign.categoria || "Social"}
           </Badge>
           {campaign.distancia_formatada && (
              <Badge className="bg-vax-primary text-white border-none shadow-2xl font-black px-5 py-2.5 text-[9px] rounded-full flex items-center gap-2">
                 <Navigation className="w-3.5 h-3.5" /> {campaign.distancia_formatada}
              </Badge>
           )}
        </div>
      </div>
      
      <div className="p-10 flex flex-col flex-1 space-y-8">
        <div className="flex-1 space-y-5">
          <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
             <MapPin className="w-4 h-4 text-vax-primary" /> Cazenga, Luanda • AF-NIF
          </div>
          <h3 className="text-3xl font-bold text-vax-primary leading-[1.1] group-hover:text-vax-primary/70 transition-colors tracking-tighter">
            {campaign.titulo}
          </h3>
          <p className="text-slate-500 text-base font-medium line-clamp-3 leading-relaxed opacity-80">
            {campaign.descricao}
          </p>
        </div>
        
        <div className="space-y-6 pt-6 border-t border-vax-border">
          <div className="flex justify-between items-end">
             <div className="space-y-2">
                <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Saldo Mobilizado</span>
                <span className="text-3xl font-bold text-vax-primary tracking-tighter tabular-nums leading-none">
                   {Number(campaign.valor_arrecadado).toLocaleString()} <span className="text-sm font-medium text-slate-300">AKZ</span>
                </span>
             </div>
             <div className="text-right">
                <span className="block text-[10px] font-black text-vax-primary uppercase tracking-widest mb-1">{Math.floor(percentage)}%</span>
                <span className="text-[9px] font-bold text-slate-300 tracking-tighter tabular-nums">/{Number(campaign.valor_meta).toLocaleString()}</span>
             </div>
          </div>
          
          <div className="w-full h-3 bg-vax-input rounded-full overflow-hidden shadow-inner p-0.5 border border-vax-border/50">
             <motion.div 
               initial={{ width: 0 }}
               whileInView={{ width: `${percentage}%` }}
               viewport={{ once: true }}
               transition={{ duration: 1, ease: "easeOut" }}
               className={`h-full rounded-full shadow-lg ${percentage >= 100 ? 'bg-vax-success-DEFAULT' : 'bg-vax-primary'}`} 
             />
          </div>

          <div className="flex justify-between items-center bg-slate-50 p-4 rounded-3xl border border-vax-border">
             <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <Clock className="w-5 h-5 text-vax-primary" />
                {daysLeft} dias
             </div>
             <Link to={`/campanhas/${campaign.id}`}>
               <Button className="h-10 px-6 rounded-full font-black text-[10px] uppercase tracking-widest shadow-lg shadow-vax-primary/20">
                  APOIAR <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
               </Button>
             </Link>
          </div>
        </div>
      </div>
    </Card>
  );
};
