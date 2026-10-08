import type { JSX } from "react";

type DefinitionItemProps = Readonly<{
  description: string;
  term: string;
}>;

function DefinitionItem({
  description,
  term,
}: DefinitionItemProps): JSX.Element {
  return (
    <div>
      <dt>{term}</dt>
      <dd>{description}</dd>
    </div>
  );
}

export { DefinitionItem };
