import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router";

export default function ModuleHeader({ eyebrow, title, description, action }) {
  const navigate = useNavigate();
  return (
    <header className="module-header">
      <div className="module-title-wrap">
        <button className="module-back" aria-label="Voltar ao dashboard" onClick={() => navigate("/dashboard")}><ArrowLeft size={17} /></button>
        <div><span>{eyebrow}</span><h1>{title}</h1><p>{description}</p></div>
      </div>
      {action}
    </header>
  );
}
