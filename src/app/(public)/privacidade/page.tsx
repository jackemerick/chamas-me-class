import type { Metadata } from "next";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";

export const metadata: Metadata = { title: "Política de Privacidade — Chamas-me Class" };

const UPDATED = "20 de junho de 2026";

export default function PrivacidadePage() {
  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>Política de Privacidade</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>Última atualização: {UPDATED}</Typography>

      <Section title="1. Quem somos">
        <P>
          O Chamas-me Class é um sistema gratuito de gestão de classes bíblicas desenvolvido e mantido por
          Jack Lopes Emerick Dutra, pessoa física, de forma voluntária e sem fins lucrativos,
          como parte do projeto Chamas-me. Contato: <a href="mailto:contato@jackemerick.com.br">contato@jackemerick.com.br</a>.
        </P>
      </Section>

      <Section title="2. Que dados coletamos">
        <P>Coletamos apenas os dados estritamente necessários para o funcionamento do sistema:</P>
        <ul>
          <li><b>Usuários (professores e líderes):</b> nome completo, endereço de e-mail, foto de perfil (opcional).</li>
          <li><b>Alunos:</b> nome completo, data de nascimento, cidade, nome e telefone do responsável. Esses dados são inseridos manualmente pelos líderes da classe.</li>
          <li><b>Registros de atividade:</b> frequência em encontros, pontos acumulados, anotações de aulas.</li>
          <li><b>Dados técnicos:</b> logs de acesso gerados automaticamente pelo Supabase (provedor de banco de dados) para fins de segurança.</li>
        </ul>
        <P>Não coletamos dados financeiros, documentos de identidade (CPF, RG) nem informações de saúde.</P>
      </Section>

      <Section title="3. Como usamos os dados">
        <P>Os dados coletados são usados exclusivamente para:</P>
        <ul>
          <li>Permitir o acesso ao sistema pelos usuários cadastrados;</li>
          <li>Registrar e exibir a frequência e pontuação dos alunos às suas respectivas turmas;</li>
          <li>Gerar certificados de participação ao final de cada temporada;</li>
          <li>Enviar o link de acesso (magic link) por e-mail para autenticação.</li>
        </ul>
        <P>Não usamos os dados para fins publicitários, comerciais ou de perfilamento.</P>
      </Section>

      <Section title="4. Dados de menores de idade">
        <P>
          O sistema destina-se ao gerenciamento de classes de juniores e adolescentes. Os dados dos alunos
          menores de 18 anos são inseridos pelos responsáveis pela classe (professores e líderes) e não
          pelos próprios menores. Nenhuma conta de acesso ao sistema é criada em nome de menores.
        </P>
        <P>
          Os dados de alunos menores ficam restritos à organização (igreja) responsável pela turma e
          não são compartilhados com terceiros.
        </P>
      </Section>

      <Section title="5. Base legal (LGPD)">
        <P>
          O tratamento dos dados é realizado com base no <b>legítimo interesse</b> (art. 7º, IX da Lei 13.709/2018)
          para a gestão de atividades educacionais e religiosas voluntárias, e no <b>consentimento</b> do usuário
          ao criar sua conta no sistema.
        </P>
      </Section>

      <Section title="6. Compartilhamento de dados">
        <P>Os dados são armazenados na plataforma <b>Supabase</b> (servidores localizados nos EUA), que atua
        como operador de dados sob contrato de uso. Não compartilhamos dados com outras empresas ou pessoas.</P>
        <P>
          O envio de e-mails transacionais (magic link de acesso) é feito via <b>Resend</b>, que recebe
          apenas o endereço de e-mail do destinatário para essa finalidade.
        </P>
      </Section>

      <Section title="7. Retenção dos dados">
        <P>
          Os dados são mantidos enquanto a organização estiver ativa no sistema. Ao solicitar a exclusão
          da conta ou organização, todos os dados associados são removidos em até 30 dias.
        </P>
      </Section>

      <Section title="8. Seus direitos">
        <P>Nos termos da LGPD, você tem direito a:</P>
        <ul>
          <li>Confirmar a existência de tratamento dos seus dados;</li>
          <li>Acessar, corrigir ou solicitar a exclusão dos seus dados;</li>
          <li>Revogar o consentimento a qualquer momento;</li>
          <li>Solicitar a portabilidade dos dados.</li>
        </ul>
        <P>Para exercer qualquer desses direitos, entre em contato: <a href="mailto:contato@jackemerick.com.br">contato@jackemerick.com.br</a>.</P>
      </Section>

      <Section title="9. Segurança">
        <P>
          O sistema utiliza HTTPS em todas as conexões, autenticação via magic link (sem senhas armazenadas),
          Row Level Security (RLS) no banco de dados — garantindo que cada organização acesse apenas seus
          próprios dados — e chaves de acesso separadas por nível de permissão.
        </P>
      </Section>

      <Section title="10. Alterações nesta política">
        <P>
          Esta política pode ser atualizada. Em caso de mudanças relevantes, os administradores das
          organizações serão notificados por e-mail. A data de atualização no topo desta página sempre
          reflete a versão vigente.
        </P>
      </Section>

      <Section title="11. Contato">
        <P>
          Jack Lopes Emerick Dutra<br />
          <a href="mailto:contato@jackemerick.com.br">contato@jackemerick.com.br</a>
        </P>
      </Section>
    </Box>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>{title}</Typography>
      <Divider sx={{ mb: 2 }} />
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, "& ul": { pl: 2.5, m: 0 }, "& li": { mb: 0.5 }, "& a": { color: "#334035" } }}>
        {children}
      </Box>
    </Box>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <Typography variant="body2" sx={{ lineHeight: 1.75 }}>{children}</Typography>;
}
