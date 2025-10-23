import ClientCard from '../ClientCard';

export default function ClientCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-background">
      <ClientCard
        nome="SA Veículos"
        slug="saveiculos-dash"
        investimento={95.93}
        conversas={3}
        status="ativo"
      />
      <ClientCard
        nome="AutoPrime Veículos"
        slug="autoprime-dash"
        investimento={127.50}
        conversas={8}
        status="ativo"
      />
    </div>
  );
}
