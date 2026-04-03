export const PoliticaTaxas = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-vax-background text-vax-primary p-4 pt-24">
      <h1 className="text-3xl font-bold mb-6">Política de Taxas</h1>

      <div className="max-w-3xl text-sm leading-relaxed space-y-4">

        <p>
          A Política de Taxas da Vax descreve de forma clara e objetiva como são
          aplicadas as taxas relativas ao processamento de pagamentos,
          manutenção da plataforma e serviços operacionais. Ao utilizar a Vax,
          você concorda com os termos e valores aqui apresentados.
        </p>

        <h2 className="text-xl font-semibold mt-6">1. Finalidade das Taxas</h2>
        <p>
          As taxas cobradas pela Vax destinam-se exclusivamente à manutenção,
          segurança e funcionamento contínuo da plataforma. Isso inclui custos de:
        </p>

        <ul className="list-disc ml-6 space-y-2">
          <li>Processamento de pagamentos</li>
          <li>Serviços de verificação e validação de identidade (NIF)</li>
          <li>Infraestrutura de servidores e armazenamento</li>
          <li>Sistema de geolocalização e monitoramento de campanhas</li>
          <li>Equipe de suporte e análise de denúncias</li>
          <li>Prevenção e detecção de fraudes</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6">2. Taxa de Processamento</h2>
        <p>
          Todas as contribuições realizadas na plataforma estão sujeitas a uma
          taxa de processamento aplicada automaticamente no momento da
          transação. Esta taxa é necessária para cobrir custos operacionais e
          serviços de terceiros responsáveis pelo pagamento.
        </p>

        <p>
          <strong>Taxa padrão aplicada a cada contribuição: 3.5% + 55Kz</strong>
        </p>

        <p>
          Esta taxa é descontada automaticamente do valor do financiamento antes
          de ser repassado ao criador da campanha.
        </p>

        <h2 className="text-xl font-semibold mt-6">3. Taxas de Transferência</h2>
        <p>
          Em alguns casos, podem existir taxas adicionais cobradas por serviços
          financeiros externos, como instituições bancárias ou processadores de
          pagamento. Estas taxas não são controladas pela Vax e podem variar
          conforme o método de retirada escolhido pelo utilizador.
        </p>

        <h2 className="text-xl font-semibold mt-6">4. Transparência</h2>
        <p>
          A Vax mantém total transparência sobre quaisquer taxas aplicadas. Antes
          de cada financiamento, o valor líquido que será entregue à campanha é
          exibido ao utilizador, assim como a taxa descontada.
        </p>

        <h2 className="text-xl font-semibold mt-6">5. Alterações nas Taxas</h2>
        <p>
          A Vax reserva-se o direito de atualizar os valores das taxas a qualquer
          momento, garantindo sempre a comunicação prévia aos utilizadores. Todas
          as alterações serão publicadas nesta página e entrarão em vigor na
          data de atualização.
        </p>

        <h2 className="text-xl font-semibold mt-6">5. Concordância</h2>
        <p>
          Ao utilizar os serviços da plataforma Vax, o usuário declara estar
          ciente e concordar com esta Política de Taxas.
        </p>

      </div>
    </div>
  );
};