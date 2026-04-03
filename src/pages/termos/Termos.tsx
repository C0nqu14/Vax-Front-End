export const Termos = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-vax-background text-vax-primary p-4 pt-24">
      <h1 className="text-3xl font-bold mb-6">Termos de Serviço</h1>

      <div className="max-w-3xl text-sm leading-relaxed space-y-4">

        <p>
          Bem-vindo à Vax! Estes Termos de Serviço regulam o uso da nossa
          plataforma de financiamento colaborativo. Ao utilizar nossos serviços,
          você concorda com todas as regras aqui estabelecidas. Caso não
          concorde, não deverá utilizar a plataforma.
        </p>

        <h2 className="text-xl font-semibold mt-6">1. Objetivo da Plataforma</h2>
        <p>
          A Vax é uma plataforma que permite que usuários criem campanhas e
          recebam contribuições de outros usuários para causas sociais,
          pessoais ou comunitárias. A Vax não é uma instituição financeira, não
          oferece crédito nem garante o sucesso das campanhas.
        </p>

        <h2 className="text-xl font-semibold mt-6">2. Cadastro e Conta do Usuário</h2>
        <p>
          Para criar uma conta, o usuário deve fornecer nome completo, NIF e uma
          senha. O sistema valida automaticamente as informações do NIF. Contas
          associadas a NIFs desativados ou inválidos terão limitações de uso,
          podendo apenas visualizar campanhas.
        </p>

        <h2 className="text-xl font-semibold mt-6">3. Uso da Plataforma</h2>
        <p>
          O usuário compromete-se a utilizar a plataforma de forma legal e ética.
          É proibido criar campanhas fraudulentas, enganosas ou que violem a
          legislação angolana. O usuário é responsável pelas informações
          fornecidas na criação da sua campanha.
        </p>

        <h2 className="text-xl font-semibold mt-6">4. Financiamentos e Pagamentos</h2>
        <p>
          Os pagamentos realizados na plataforma estão sujeitos a taxas de
          processamento e taxas de serviço da Vax, conforme descrito na Política
          de Taxas. Antes de confirmar um pagamento, o usuário visualizará o
          valor total, descontos aplicados e o valor líquido destinado à
          campanha.
        </p>

        <h2 className="text-xl font-semibold mt-6">5. Política de Taxas</h2>
        <p>
          A Vax poderá cobrar taxas de serviço pelo uso da plataforma, além das
          taxas cobradas pelo provedor de processamento de pagamentos. Os valores
          e detalhes estão definidos na Política de Taxas disponível no site.
          Ao utilizar a plataforma, o usuário concorda com tais cobranças.
        </p>

        <h2 className="text-xl font-semibold mt-6">6. Denúncias e Segurança</h2>
        <p>
          Usuários podem denunciar campanhas ou perfis que considerem
          suspeitos. A Vax analisará cada caso e poderá suspender ou remover
          campanhas e contas que violem os Termos de Serviço ou apresentem
          comportamento fraudulento.
        </p>

        <h2 className="text-xl font-semibold mt-6">7. Suspensão e Encerramento de Conta</h2>
        <p>
          A Vax reserva-se o direito de suspender ou encerrar contas que violem
          estes termos, que utilizem informações falsas ou que estejam
          envolvidas em fraudes ou atividades ilegais.
        </p>

        <h2 className="text-xl font-semibold mt-6">8. Alterações dos Termos</h2>
        <p>
          A Vax pode atualizar estes Termos de Serviço a qualquer momento.
          Mudanças entram em vigor após a publicação nesta página. Recomendamos
          que o usuário revise periodicamente esta seção para acompanhar
          alterações.
        </p>

        <h2 className="text-xl font-semibold mt-6">9. Aceitação dos Termos</h2>
        <p>
          Ao usar a plataforma, o usuário confirma que leu, compreendeu e
          concorda com estes Termos de Serviço.
        </p>

      </div>
    </div>
  );
};