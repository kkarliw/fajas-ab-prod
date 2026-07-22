import { ReactNode } from "react";
import Ticker from "@/components/Ticker";
import Navbar from "@/components/Navbar";
import PromoBar from "@/components/PromoBar";
import Footer from "@/components/Footer";

type Props = {
  eyebrow?: string;
  title: string;
  intro?: string;
  children: ReactNode;
};

const LegalLayout = ({ eyebrow = "Legal", title, intro, children }: Props) => (
  <div className="min-h-screen bg-cream flex flex-col">
    <Ticker />
    <Navbar />
    <PromoBar />

    <section className="border-b border-hairline bg-cream-2">
      <div className="container-luxe py-16 md:py-24 text-center max-w-3xl mx-auto">
        <p className="eyebrow text-ink/60 mb-5">{eyebrow}</p>
        <h1 className="font-display text-[40px] md:text-[60px] leading-[1.05] text-ink">
          {title}
        </h1>
        {intro && (
          <p className="mt-6 font-body text-[14px] md:text-[15px] text-ink/70 leading-relaxed max-w-2xl mx-auto">
            {intro}
          </p>
        )}
      </div>
    </section>

    <main className="flex-1">
      <div className="container-luxe py-14 md:py-20">
        <article className="max-w-3xl mx-auto prose-luxe">
          {children}
        </article>
      </div>
    </main>

    <Footer />
  </div>
);

export default LegalLayout;
