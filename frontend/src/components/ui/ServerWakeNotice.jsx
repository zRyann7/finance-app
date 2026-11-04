export default function ServerWakeNotice() {
  return (
    <div className="login-wake" role="status">
      <span className="login-wake-spinner" aria-hidden="true" />
      <span>Iniciando o servidor… o primeiro acesso pode levar até 1 minuto.</span>
    </div>
  );
}
