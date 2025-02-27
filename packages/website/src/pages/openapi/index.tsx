import abstractionCode from "!!raw-loader!@site/static/tsp-samples/openapi3/abstraction.tsp";
import { Links } from "@site/src/constants";
import TabItem from "@theme/TabItem";
import Tabs from "@theme/Tabs";
import { CodeBlock } from "../../components/code-block/code-block";
import { ShowcaseLayout } from "../../components/layouts/fluent-layout";
import { Section } from "../../components/section/section";
import { SectionedLayout } from "../../components/sectioned-layout/sectioned-layout";
import { UseCaseOverview } from "../../components/use-case-overview/use-case-overview";
import style from "./openapi.module.css";
export default function Home() {
  return (
    <ShowcaseLayout>
      <OpenApiContent />
    </ShowcaseLayout>
  );
}

const OpenApiContent = () => {
  return (
    <div>
      <UseCaseOverview
        title="Write TypeSpec, emit OpenAPI"
        subtitle="Emitting OpenAPI from TypeSpec enables seamless cross-language interaction, automates API-related tasks, and simplifies API management and evolution."
        link={Links.gettingStartedOpenAPI}
        illustration={<OpenAPI3HeroIllustration />}
      />
      <SectionedLayout>
        <Section
          header="Ecosystem"
          title="Interoperate with the OpenAPI ecosystem"
          description="Benefit from a huge ecosystem of OpenAPI tools for configuring API gateways, generating code, and validating your data."
          illustration={<OpenAPI3InteroperateIllustration />}
        >
          <LearnMoreCard
            title="Linters"
            description="Integrate with spectral to lint your OpenAPI."
            image="shield-blue"
            link={Links.spectral}
          />
        </Section>

        <Section
          layout="text-right"
          header="Ecosystem"
          title="Abstract common patterns"
          description="Codify API patterns into reusable components, improving up quality and consistency across your API surface."
          illustration={<OpenAPI3AbstractCode />}
        >
          <LearnMoreCard
            title="Example: TypeSpec Azure Library"
            description="Azure library for TypeSpec allows a multitude of teams to reuse approved patterns."
            image="document-cloud"
            link={Links.typespecAzure}
          />
        </Section>
      </SectionedLayout>
    </div>
  );
};

import heroMainTsp from "!!raw-loader!@site/static/tsp-samples/openapi3/hero/main.tsp";
import heroOpenAPIYaml from "!!raw-loader!@site/static/tsp-samples/openapi3/hero/out/openapi.yaml";
import { IllustrationCard } from "../../components/illustration-card/illustration-card";
import { OpenAPI3InteroperateIllustration } from "../../components/interoperate-illustration/interoperate-illustration";
import { LearnMoreCard } from "../../components/learn-more-card/learn-more-card";

export const OpenAPI3HeroIllustration = () => {
  return (
    <IllustrationCard>
      <Tabs>
        <TabItem value="main.tsp">
          <CodeBlock language="tsp">{heroMainTsp}</CodeBlock>
        </TabItem>
        <TabItem value="openapi.yaml">
          <div className={style["hero-openapi"]}>
            <CodeBlock language="yaml">{heroOpenAPIYaml}</CodeBlock>
          </div>
        </TabItem>
      </Tabs>
    </IllustrationCard>
  );
};

export const OpenAPI3AbstractCode = () => {
  return (
    <IllustrationCard>
      <CodeBlock language="tsp">{abstractionCode}</CodeBlock>
    </IllustrationCard>
  );
};
