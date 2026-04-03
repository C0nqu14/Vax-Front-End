export const PoliticaPrivacidade = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-vax-background text-vax-primary p-4 pt-24">
      <h1 className="text-3xl font-bold mb-6">Política de Privacidade</h1>

      <div className="max-w-3xl text-sm leading-relaxed space-y-4">

        <p>
          A Vax valoriza a privacidade e a segurança dos seus usuários. 
          Esta Política de Privacidade descreve como coletamos, utilizamos, 
          armazenamos e protegemos os dados pessoais fornecidos na plataforma.
          Ao utilizar nossos serviços, você concorda com as práticas descritas
          nesta política.
        </p>

        <h2 className="text-xl font-semibold mt-6">1. Informações que Coletamos</h2>
        <p>
          Para garantir a segurança e o funcionamento adequado da plataforma,
          podemos coletar as seguintes informações:
        </p>

        <ul className="list-disc ml-6 space-y-2">
          <li>Nome completo</li>
          <li>NIF para validação de identidade</li>
          <li>Senha (armazenada de forma criptografada)</li>
          <li>Dados de campanhas criadas</li>
          <li>Histórico de financiamentos realizados</li>
          <li>Denúncias feitas ou recebidas</li>
          <li>Dados de geolocalização fornecidos ao criar campanhas</li>
          <li>Informações técnicas, como endereço IP e tipo de dispositivo</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6">2. Como Utilizamos os Dados</h2>
        <p>Os dados coletados são utilizados para os seguintes fins:</p>

        <ul className="list-disc ml-6 space-y-2">
          <li>Validar a autenticidade de usuários através do NIF</li>
          <li>Permitir a criação e o gerenciamento de campanhas</li>
          <li>Processar pagamentos e contribuir para campanhas</li>
          <li>Garantir a segurança e prevenir fraudes</li>
          <li>Responder denúncias e resolver conflitos</li>
          <li>Melhorar a experiência do usuário e o desempenho da plataforma</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6">3. Partilha de Informações</h2>
        <p>
          A Vax não vende nem partilha dados pessoais com terceiros para fins
          comerciais. Contudo, podemos partilhar dados nas seguintes situações:
        </p>

        <ul className="list-disc ml-6 space-y-2">
          <li>Com provedores de pagamento para processar transações</li>
          <li>Com autoridades governamentais, quando exigido por lei</li>
          <li>Com sistemas de validação de identidade, exclusivamente para verificação de NIF</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6">4. Segurança dos Dados</h2>
        <p>
          Utilizamos práticas modernas de segurança para proteger as informações
          dos usuários, incluindo criptografia de senhas, políticas de acesso
          restrito, logs de auditoria e monitoramento de comportamentos
          suspeitos. Embora adotemos medidas robustas, nenhum sistema digital é
          100% infalível.
        </p>

        <h2 className="text-xl font-semibold mt-6">5. Retenção de Dados</h2>
        <p>
          Os dados são mantidos enquanto a conta estiver ativa ou conforme
          necessário para cumprir exigências legais, auditorias internas e
          prevenção de fraudes. O usuário pode solicitar a exclusão da conta,
          salvo casos em que a lei exija retenção.
        </p>

        <h2 className="text-xl font-semibold mt-6">6. Direitos do Usuário</h2>
        <p>O usuário tem direito a:</p>

        <ul className="list-disc ml-6 space-y-2">
          <li>Acessar e corrigir seus dados pessoais</li>
          <li>Solicitar a exclusão da sua conta</li>
          <li>Solicitar informações sobre como seus dados são tratados</li>
          <li>Contestar o uso indevido de dados</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6">7. Cookies e Tecnologias Semelhantes</h2>
        <p>
          Utilizamos cookies para melhorar o desempenho da plataforma,
          personalizar experiências e recolher dados técnicos essenciais. Para
          mais detalhes, consulte a Política de Cookies disponível no site.
        </p>

        <h2 className="text-xl font-semibold mt-6">8. Alterações nesta Política</h2>
        <p>
          A Vax poderá atualizar esta Política de Privacidade periodicamente.
          As alterações entram em vigor após publicação nesta página. Recomendamos
          revisitar este documento regularmente.
        </p>

        <h2 className="text-xl font-semibold mt-6">9. Aceitação da Política</h2>
        <p>
          Ao utilizar a plataforma, você declara que leu, compreendeu e concorda
          com esta Política de Privacidade.
        </p>

      </div>
    </div>
  );
};