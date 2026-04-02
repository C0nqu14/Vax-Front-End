import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  PlusCircle, 
  Image as ImageIcon, 
  Calendar, 
  MapPin, 
  ArrowRight, 
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  DollarSign,
  Type,
  FileText
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../services/supabase";
import api from "../services/api";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";

export const CreateCampaignPage = () => {
  const [step, setStep] = useState(1);
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [valorMeta, setValorMeta] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [categoria, setCategoria] = useState("Social");
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleCreate = async () => {
    setLoading(true);
    setError(null);

    try {
      let imageUrl = "";

      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `uploads/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('campanhas_imagens')
          .upload(filePath, imageFile);

        if (uploadError) throw new Error(`Falha no upload da imagem: ${uploadError.message}`);

        const { data: { publicUrl } } = supabase.storage
          .from('campanhas_imagens')
          .getPublicUrl(filePath);
          
        imageUrl = publicUrl;
      }

      try {
        await api.post("/campanhas", {
          titulo,
          descricao,
          valor_meta: parseFloat(valorMeta),
          data_fim: new Date(dataFim).toISOString(),
          latitude: parseFloat(lat),
          longitude: parseFloat(lng),
          categoria: categoria || 'Social',
          imagem_url: imageUrl
        });
      } catch (apiError) {
        console.warn("⚠ API /campanhas falhou ao criar campanha, tentando Supabase:", apiError);
        const supObj: any = {
          titulo,
          descricao,
          valor_meta: parseFloat(valorMeta),
          data_fim: new Date(dataFim).toISOString(),
          latitude: parseFloat(lat) || null,
          longitude: parseFloat(lng) || null,
          categoria: categoria || 'Social',
          imagem_url: imageUrl || null,
          estado: 'ativa',
          data_criacao: new Date().toISOString(),
          usuario_id: (localStorage.getItem('vax_user') ? JSON.parse(localStorage.getItem('vax_user') || '{}').id : null),
          valor_arrecadado: 0.00
        };
        try {
          const { data, error } = await supabase.from('campanhas').insert(supObj).select();
          if (error) {
            console.error("❌ Erro do Supabase:", error);
            throw error;
          }
        } catch (supError) {
          console.error("❌ Falha no fallback Supabase de criar campanha:", supError);
          throw supError;
        }
      }

      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Falha ao criar campanha. Verifique sua conexão.");
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step < 3) setStep(step + 1);
    else handleCreate();
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const steps = [
    { n: 1, title: "O básico", desc: "Título e categoria" },
    { n: 2, title: "A história", desc: "Descrição e imagem" },
    { n: 3, title: "Metas", desc: "Valores e prazos" }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <Badge variant="info" className="mb-4">NOVO PROJETO</Badge>
           <h1 className="text-4xl font-bold text-vax-primary tracking-tight">Criar Campanha</h1>
           <p className="text-slate-500 font-medium text-lg mt-1">Transforme sua ideia em impacto real em {steps.length} etapas.</p>
        </div>
        <button 
          onClick={() => navigate(-1)} 
          className="text-sm font-bold text-slate-400 hover:text-vax-error-DEFAULT transition-colors flex items-center gap-2"
        >
          Descartar rascunho
        </button>
      </header>

      {/* Wizard Progress Bar */}
      <div className="relative">
         <div className="absolute top-1/2 left-0 w-full h-1 bg-vax-input -translate-y-1/2 z-0 rounded-full" />
         <div 
           className="absolute top-1/2 left-0 h-1 bg-vax-primary -translate-y-1/2 z-0 rounded-full transition-all duration-500" 
           style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
         />
         <div className="relative z-10 flex justify-between">
            {steps.map((s) => (
               <div key={s.n} className="flex flex-col items-center gap-3">
                  <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all duration-500
                    ${step >= s.n ? 'bg-vax-primary text-white shadow-lg' : 'bg-white text-slate-300 border border-vax-border'}
                  `}>
                    {step > s.n ? <CheckCircle2 className="w-6 h-6" /> : s.n}
                  </div>
                  <div className="text-center hidden md:block">
                     <p className={`text-xs font-bold uppercase tracking-widest ${step >= s.n ? 'text-vax-primary' : 'text-slate-300'}`}>{s.title}</p>
                     <p className="text-[10px] text-slate-400 mt-0.5">{s.desc}</p>
                  </div>
               </div>
            ))}
         </div>
      </div>

      {error && (
        <Card className="p-4 border-vax-error-DEFAULT/20 bg-vax-error-light/50 text-vax-error-DEFAULT flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm font-bold">{error}</p>
        </Card>
      )}

      {/* Main Form Content */}
      <Card className="p-10 shadow-2xl min-h-[500px] flex flex-col">
        <div className="flex-1">
          <AnimatePresence mode="wait">
             {step === 1 && (
               <motion.div 
                 key="step1"
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: -20 }}
                 className="space-y-8"
               >
                  <div className="space-y-6">
                     <h3 className="text-xl font-bold text-vax-primary">Informações Iniciais</h3>
                     <Input 
                       label="Como as pessoas devem chamar seu projeto?"
                       placeholder="Ex: Refeitório comunitário no Cazenga"
                       value={titulo}
                       onChange={(e) => setTitulo(e.target.value)}
                       required
                       leftIcon={<Type className="w-4 h-4" />}
                     />
                  </div>
               </motion.div>
             )}

             {step === 2 && (
               <motion.div 
                 key="step2"
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: -20 }}
                 className="space-y-8"
               >
                  <div className="space-y-6">
                     <h3 className="text-xl font-bold text-vax-primary">História e Imagem</h3>
                     
                     <div className="space-y-1.5">
                        <div className="flex items-center gap-2 mb-1 px-1 text-sm font-bold text-vax-primary">
                           <FileText className="w-4 h-4" /> Descreva sua causa
                        </div>
                        <textarea 
                          required
                          rows={6}
                          value={descricao}
                          onChange={(e) => setDescricao(e.target.value)}
                          className="w-full bg-vax-input/50 border border-vax-border rounded-vax p-4 outline-none focus:border-vax-primary transition-all font-medium text-vax-primary resize-none placeholder:text-slate-400"
                          placeholder="Conte a história do seu projeto, quem será ajudado e qual o objetivo final..."
                        />
                     </div>

                     <div className="space-y-1.5">
                        <div className="flex items-center gap-2 mb-1 px-1 text-sm font-bold text-vax-primary">
                           <ImageIcon className="w-4 h-4" /> Foto de capa
                        </div>
                        <div 
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full aspect-video md:aspect-[3/1] bg-vax-input border-2 border-dashed border-vax-border rounded-[32px] flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-all overflow-hidden relative group"
                        >
                          {previewUrl ? (
                            <img src={previewUrl} className="w-full h-full object-cover transition-transform group-hover:scale-105" alt="Preview" />
                          ) : (
                            <div className="flex flex-col items-center gap-3">
                               <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-vax group-hover:scale-110 transition-transform">
                                  <PlusCircle className="w-6 h-6 text-vax-primary" />
                               </div>
                               <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Enviar foto impactante</span>
                            </div>
                          )}
                        </div>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                     </div>
                  </div>
               </motion.div>
             )}

             {step === 3 && (
               <motion.div 
                 key="step3"
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: -20 }}
                 className="space-y-8"
               >
                  <div className="space-y-8">
                     <h3 className="text-xl font-bold text-vax-primary">Metas e Localização</h3>
                     
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Input 
                          label="Meta de Arrecadação (AKZ)"
                          type="number"
                          placeholder="0.00"
                          value={valorMeta}
                          onChange={(e) => setValorMeta(e.target.value)}
                          required
                          leftIcon={<DollarSign className="w-4 h-4" />}
                        />
                        <Input 
                          label="Data Limite"
                          type="date"
                          value={dataFim}
                          onChange={(e) => setDataFim(e.target.value)}
                          required
                          leftIcon={<Calendar className="w-4 h-4" />}
                        />
                     </div>

                     <div className="p-6 bg-vax-input/30 rounded-vax border border-vax-border space-y-6">
                        <div className="flex items-center gap-2 font-bold text-vax-primary text-sm">
                           <MapPin className="w-4 h-4 text-vax-error-DEFAULT" /> Localização do Projeto
                        </div>
                        
                        <div className="space-y-4 pb-6 border-b border-vax-border">
                          <p className="text-sm text-slate-600 font-medium">Opção 1: Detectar automaticamente sua localização</p>
                          <Button 
                            onClick={async () => {
                              if (!navigator.geolocation) {
                                alert("Geolocalização não suportada neste navegador.");
                                return;
                              }
                              
                              try {
                                const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                                  navigator.geolocation.getCurrentPosition(resolve, reject, {
                                    enableHighAccuracy: true,
                                    timeout: 10000,
                                    maximumAge: 0
                                  });
                                });
                                
                                setLat(position.coords.latitude.toString());
                                setLng(position.coords.longitude.toString());
                              } catch (error) {
                                console.error("Erro na geolocalização:", error);
                                alert("Não foi possível obter sua localização. Verifique as permissões do navegador.");
                              }
                            }}
                            variant="outline"
                            className="w-full bg-white border-vax-primary text-vax-primary hover:bg-vax-primary hover:text-white"
                            leftIcon={<MapPin className="w-4 h-4" />}
                          >
                            Detectar Automaticamente
                          </Button>
                          
                          {(lat && lng) && (
                            <div className="p-4 bg-vax-success-light/20 border border-vax-success-DEFAULT/20 rounded-xl">
                              <div className="flex items-center gap-2 text-vax-success-DEFAULT font-bold text-sm">
                                <CheckCircle2 className="w-4 h-4" /> Localização Detectada
                              </div>
                              <p className="text-xs text-slate-600 mt-1">
                                Latitude: <span className="font-mono text-vax-primary">{Number(lat).toFixed(6)}</span> | Longitude: <span className="font-mono text-vax-primary">{Number(lng).toFixed(6)}</span>
                              </p>
                            </div>
                          )}
                        </div>
                        
                        <div className="space-y-4">
                          <p className="text-sm text-slate-600 font-medium">Opção 2: Ou digite manualmente (se a geolocalização não funcionar)</p>
                          <div className="grid grid-cols-2 gap-4">
                            <Input
                              label="Latitude"
                              type="number"
                              step="any"
                              placeholder="Ex: -8.8383"
                              value={lat}
                              onChange={(e) => setLat(e.target.value)}
                              required
                              leftIcon={<MapPin className="w-4 h-4" />}
                            />
                            <Input
                              label="Longitude"
                              type="number"
                              step="any"
                              placeholder="Ex: 13.2344"
                              value={lng}
                              onChange={(e) => setLng(e.target.value)}
                              required
                              leftIcon={<MapPin className="w-4 h-4" />}
                            />
                          </div>
                        </div>
                        
                        <p className="text-[10px] font-medium text-slate-400 italic border-t border-vax-border pt-4">A localização é necessária para que doadores encontrem seu projeto no mapa de proximidade. Valores aproximados: Cazenga ~(-8.84, 13.23) | Talatona ~(-8.94, 13.24)</p>
                      </div>
                  </div>
               </motion.div>
             )}
          </AnimatePresence>
        </div>

        {/* Wizard Navigation Panel */}
        <div className="mt-12 pt-8 border-t border-vax-border flex items-center justify-between">
            <button 
              onClick={prevStep}
              disabled={step === 1 || loading}
              className={`
                flex items-center gap-2 font-bold transition-all
                ${step === 1 ? 'opacity-0 cursor-default' : 'text-slate-400 hover:text-vax-primary'}
              `}
            >
               <ChevronLeft className="w-5 h-5" /> Voltar
            </button>

            <Button 
              onClick={nextStep}
              disabled={loading}
              className="px-10 py-4 shadow-xl shadow-vax-primary/10 group"
              isLoading={loading}
              rightIcon={step < 3 ? <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" /> : <CheckCircle2 className="w-5 h-5" />}
            >
               {step === 3 ? "Lançar Projeto" : "Continuar"}
            </Button>
        </div>
      </Card>
      
      {/* Security Info */}
      <div className="flex items-center justify-center gap-8 opacity-40grayscale">
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
             <CheckCircle2 className="w-3.5 h-3.5 text-vax-success-DEFAULT" /> Verificação de NIF Necessária
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
             <CheckCircle2 className="w-3.5 h-3.5 text-vax-success-DEFAULT" /> Retenção de 3.5% + 55kz p/ Manutenção
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
             <CheckCircle2 className="w-3.5 h-3.5 text-vax-success-DEFAULT" /> Pagamento Seguro via PaysGator
          </div>
      </div>
    </div>
  );
};

