import type { Metadata } from "next";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";

export const metadata: Metadata = { title: "Termos de Uso — Chamas-me Class" };

const UPDATED = "20 de junho de 2026";

export default function TermosPage() {
  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>Termos de Uso</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>Última atualização: {UPDATED}</Typography>

      <Section title="1. Sobre o serviço">
        <P>
          O Chamas-me Class é um sistema gratuito de gestão de classes bíblicas desenvolvido por
          Jack Lopes Emerick Dutra como parte do projeto voluntário Chamas-me. O sistema é oferecido
          sem custo, sem fins lucrativos e sem qualquer garantia de disponibilidade contínua.
        </P>
      </Section>

      <Section title="2. Aceitação dos termos">
        <P>
          Ao criar uma conta ou utilizar o sistema, o usuário declara ter lido e concordado com estes
          Termos de Uso e com a <a href="/privacidade">Política de Privacidade</a>. O uso é permitido
          exclusivamente para fins educacionais e religiosos em contexto de classes bíblicas.
        </P>
      </Section>

      <Section title="3. Quem pode usar">
        <P>O sistema destina-se a:</P>
        <ul>
          <li>Líderes, professores e coordenadores de classes bíblicas;</li>
          <li>Organizações religiosas (igrejas, ministérios, grupos) que gerenciam classes de ensino bíblico.</li>
        </ul>
        <P>
          O cadastro de menores de idade como alunos é permitido e responsabilidade exclusiva do líder
          ou professor que realizou o cadastro, com o consentimento dos responsáveis legais.
        </P>
      </Section>

      <Section title="4. Uso aceitável">
        <P>O usuário compromete-se a:</P>
        <ul>
          <li>Usar o sistema apenas para fins de gestão de classes bíblicas;</li>
          <li>Inserir apenas dados verdadeiros e relevantes para o funcionamento da classe;</li>
          <li>Não compartilhar as credenciais de acesso com terceiros não autorizados;</li>
          <li>Respeitar a privacidade dos alunos cadastrados, especialmente menores de idade;</li>
          <li>Não tentar acessar dados de outras organizações além da sua.</li>
        </ul>
      </Section>

      <Section title="5. Responsabilidades do usuário">
        <P>
          O usuário é inteiramente responsável pelo conteúdo que insere no sistema — nomes, dados de
          alunos, anotações e quaisquer outros registros. O desenvolvedor não se responsabiliza por
          uso indevido, perda de dados causada pelo próprio usuário ou conteúdo inserido de forma
          incorreta ou maliciosa.
        </P>
      </Section>

      <Section title="6. Sem garantias">
        <P>
          O Chamas-me Class é oferecido no estado em que se encontra, sem garantia de disponibilidade
          ininterrupta, ausência de erros ou adequação a qualquer finalidade específica. Por ser um
          projeto voluntário, manutenções, atualizações ou até a descontinuação do serviço podem
          ocorrer sem aviso prévio.
        </P>
      </Section>

      <Section title="7. Sem cobrança">
        <P>
          O uso do sistema é completamente gratuito. Não há planos pagos, assinaturas ou qualquer
          transação financeira envolvida.
        </P>
      </Section>

      <Section title="8. Propriedade intelectual">
        <P>
          O código, design e conteúdo do sistema são de autoria de Jack Lopes Emerick Dutra. Os dados
          inseridos pelas organizações (turmas, alunos, encontros) permanecem de propriedade das
          respectivas organizações.
        </P>
      </Section>

      <Section title="9. Encerramento de conta">
        <P>
          O usuário pode solicitar o encerramento da sua conta a qualquer momento via
          {" "}<a href="mailto:contato@chamas.me">contato@chamas.me</a>.
          Administradores podem encerrar a organização, o que resultará na exclusão de todos os dados
          associados em até 30 dias.
        </P>
      </Section>

      <Section title="10. Alterações nos termos">
        <P>
          Estes termos podem ser atualizados a qualquer momento. O uso continuado do sistema após a
          publicação de uma nova versão implica na aceitação dos termos atualizados.
        </P>
      </Section>

      <Section title="11. Legislação aplicável">
        <P>
          Estes termos são regidos pelas leis brasileiras. Qualquer disputa será resolvida no foro
          da comarca de domicílio do responsável pelo projeto.
        </P>
      </Section>

      <Section title="12. Contato">
        <P>
          Jack Lopes Emerick Dutra<br />
          <a href="mailto:contato@chamas.me">contato@chamas.me</a>
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
