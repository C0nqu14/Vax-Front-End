import {
  ArrowRight,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  HeartPulse,
  Lightbulb,
  Sprout,
} from "lucide-react";
import { useEffect, useRef, useState, type SyntheticEvent } from "react";
import { Link } from "react-router-dom";
import logo from "../../assets/vax-logo-transparent.png";
import vaxTeam from "../../assets/vaxteam.jpg";
import { useAuth } from "../contexts/AuthContext";

const unsplashImage = (photoId: string, width: number) =>
  `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=${width}&q=85`;

const display = "font-['Manrope',system-ui,sans-serif]";

const slides = [
  unsplashImage("photo-1488521787991-ed7bbaae773c", 2000),
  unsplashImage("photo-1531206715517-5c0ba140b2b8", 2000),
  unsplashImage("photo-1620969910995-4bbe4eaa32c1", 2000),
];

const causes = [
  { icon: BookOpen, title: "Educação", image: unsplashImage("photo-1654027879796-b9dee8caabb6", 800) },
  { icon: HeartPulse, title: "Saúde", image: unsplashImage("photo-1643297653753-2d3f459edc6b", 800) },
  { icon: Lightbulb, title: "Empreendedorismo", image: unsplashImage("photo-1548838670-cb67b43a6adb", 800) },
  { icon: Sprout, title: "Ambiente", image: unsplashImage("photo-1649573194842-6190761d6c5d", 800) },
];

const steps = [
  {
    title: "Apresente a sua causa",
    description: "Conte a sua história, explique o objetivo e indique quanto precisa para avançar.",
  },
  {
    title: "Encontre apoiadores",
    description: "Partilhe a iniciativa e convide pessoas a fazer parte da mudança.",
  },
  {
    title: "Acompanhe o impacto",
    description: "Veja o progresso da campanha e mantenha a comunidade informada.",
  },
];

const hideBrokenImage = (event: SyntheticEvent<HTMLImageElement>) => {
  event.currentTarget.style.display = "none";
};

const HeroSlides = () => {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reducedMotion = useRef(
    typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  useEffect(() => {
    if (paused || reducedMotion.current) return undefined;
    const timer = setInterval(() => setIndex((i) => (i + 1) % slides.length), 6000);
    return () => clearInterval(timer);
  }, [paused]);

  const go = (next: number) => setIndex((next + slides.length) % slides.length);

  return (
    <div
      className="absolute inset-0 bg-vax-primary"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {slides.map((src, i) => (
        <img
          key={src}
          src={src}
          alt=""
          onError={hideBrokenImage}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-black/10" />

      <div className="absolute bottom-6 right-5 z-10 flex items-center gap-3 sm:right-8">
        <div className="flex gap-2" role="group" aria-label="Escolher imagem">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Imagem ${i + 1}`}
              aria-current={i === index}
              className={`h-2 rounded-full transition-all ${
                i === index ? "w-8 bg-white" : "w-2 bg-white/50 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => go(index - 1)}
          aria-label="Imagem anterior"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur hover:bg-white/30"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => go(index + 1)}
          aria-label="Imagem seguinte"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur hover:bg-white/30"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export const HomePage = () => {
  const { user } = useAuth();
  const createCampaignPath = user ? "/campanhas/nova" : "/register";

  const navLink = "text-sm font-semibold text-slate-700 hover:text-vax-primary";
  const primaryBtn =
    "inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-vax-primary px-7 py-3 font-bold text-white transition hover:bg-vax-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vax-primary";

  return (
    <main className={`min-h-screen bg-white text-vax-primary ${display}`}>
      <header className="sticky top-0 z-30 border-b border-vax-border bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 sm:px-8">
          <div className="flex items-center gap-10">
            <Link to="/" aria-label="Vax, página inicial">
              <img src={logo} alt="Vax" className="h-8 w-auto object-contain sm:h-9" />
            </Link>
            <nav aria-label="Principal" className="hidden items-center gap-7 md:flex">
              <a href="#sobre" className={navLink}>Sobre nós</a>
              <a href="#apoiar" className={navLink}>Apoiar</a>
              <a href="#como-funciona" className={navLink}>Como funciona</a>
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <Link to="/login" className={`${navLink} px-2 py-2`}>Entrar</Link>
            <Link
              to={createCampaignPath}
              className="rounded-full bg-vax-primary px-5 py-2.5 text-sm font-bold text-white transition hover:bg-vax-primary/90"
            >
              {user ? "Criar campanha" : "Começar"}
            </Link>
          </div>
        </div>
      </header>

      <section className="relative isolate min-h-[560px] text-white sm:min-h-[640px]">
        <HeroSlides />
        <div className="pointer-events-none relative z-10 mx-auto flex min-h-[560px] max-w-7xl items-center px-5 sm:min-h-[640px] sm:px-8">
          <div className="pointer-events-auto max-w-2xl py-16">
            <h1 className="text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
              Causas locais merecem apoio coletivo.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-white/90">
              A Vax é a plataforma onde as pessoas apresentam as suas causas e
              a comunidade ajuda a torná-las realidade.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link to={createCampaignPath} className={primaryBtn}>
                {user ? "Lançar uma campanha" : "Criar campanha"}
              </Link>
              <Link
                to="/explorar"
                className="inline-flex min-h-12 items-center justify-center rounded-full border-2 border-white px-7 py-3 font-bold text-white transition hover:bg-white hover:text-vax-primary"
              >
                Apoiar uma causa
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="sobre" className="scroll-mt-20">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-2 lg:gap-20">
          <div className="relative mx-auto aspect-[2/3] w-full max-w-[480px] overflow-hidden rounded-3xl bg-vax-primary">
            <img
              src={vaxTeam}
              alt="Equipa da Vax reunida"
              onError={hideBrokenImage}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-contain"
            />
          </div>
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Sobre nós
            </h2>
            <div className="mt-5 max-w-xl space-y-4 text-lg leading-8 text-slate-600">
              <p>
                A Vax é uma plataforma de financiamento coletivo dedicada a
                iniciativas com impacto social. Ajudamos quem tem uma causa a
                contar a sua história e quem quer ajudar a encontrar projetos
                que fazem sentido.
              </p>
              <p>
                Acreditamos que a colaboração abre caminhos: uma causa de cada
                vez, com mais pessoas envolvidas e objetivos mais claros.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="apoiar" className="scroll-mt-20 bg-slate-50">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24">
          <h2 className="max-w-2xl text-3xl font-extrabold tracking-tight sm:text-4xl">
            Apoiar uma causa
          </h2>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
            Descubra projetos de diferentes áreas e contribua para os que fazem
            sentido para si.
          </p>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {causes.map(({ icon: Icon, title, image }) => (
              <Link
                key={title}
                to="/explorar"
                className="group relative isolate flex aspect-[4/5] items-end overflow-hidden rounded-2xl bg-vax-primary p-5 text-white"
              >
                <img
                  src={image}
                  alt=""
                  onError={hideBrokenImage}
                  loading="lazy"
                  className="absolute inset-0 -z-10 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                <div className="flex w-full items-center justify-between">
                  <span className="flex items-center gap-2 text-lg font-bold">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                    {title}
                  </span>
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="como-funciona" className="scroll-mt-20">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24">
          <h2 className="max-w-2xl text-3xl font-extrabold tracking-tight sm:text-4xl">
            Como funciona
          </h2>

          <ol className="mt-12 grid gap-10 md:grid-cols-3">
            {steps.map((step, i) => (
              <li key={step.title}>
                <span className="text-6xl font-extrabold text-vax-primary">{i + 1}</span>
                <h3 className="mt-3 text-xl font-bold">{step.title}</h3>
                <p className="mt-2 leading-7 text-slate-600">{step.description}</p>
              </li>
            ))}
          </ol>

          <div className="mt-14">
            <Link to={createCampaignPath} className={primaryBtn}>
              {user ? "Criar campanha" : "Criar conta na Vax"}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-vax-primary text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <Link to="/" aria-label="Vax, página inicial" className="flex items-center gap-3 transition-opacity hover:opacity-80">
              <span className="rounded-xl bg-white">
                <img src={logo} alt="" className="h-8 w-auto object-contain sm:h-9" />
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-6 text-white/70">
              Conectando pessoas e causas para gerar impacto.
            </p>
          </div>
          <nav aria-label="Plataforma" className="flex flex-col gap-3 text-sm">
            <p className="font-bold">Plataforma</p>
            <a href="#sobre" className="text-white/70 hover:text-white">Sobre nós</a>
            <a href="#apoiar" className="text-white/70 hover:text-white">Apoiar uma causa</a>
            <a href="#como-funciona" className="text-white/70 hover:text-white">Como funciona</a>
          </nav>
          <nav aria-label="Conta" className="flex flex-col gap-3 text-sm">
            <p className="font-bold">Conta</p>
            <Link to="/login" className="text-white/70 hover:text-white">Entrar</Link>
            <Link to={createCampaignPath} className="text-white/70 hover:text-white">
              {user ? "Criar campanha" : "Criar conta"}
            </Link>
          </nav>
        </div>
        <div className="border-t border-white/10 px-5 py-5 text-center text-xs text-white/50">
          © {new Date().getFullYear()} Vax. Todos os direitos reservados.
        </div>
      </footer>
    </main>
  );
};