import { ArrowRightLeft, ShieldCheck } from "lucide-react";
import ModuleHeader from "../components/ui/ModuleHeader";

export default function Transfers() {
  return <div className="module-page"><ModuleHeader eyebrow="TRANSFERÊNCIAS" title="Transferências internas" description="Área reservada para movimentações entre contas cadastradas no sistema." /><section className="module-card informative-card"><span className="informative-icon"><ArrowRightLeft size={28} /></span><h2>Funcionalidade ainda não disponível</h2><p>Este sistema não realiza transferências bancárias reais. Quando implementada, esta área servirá apenas para registrar transferências internas entre contas financeiras controladas por você.</p><div><ShieldCheck size={16} /> Nenhum dinheiro será movimentado por esta tela.</div></section></div>;
}
