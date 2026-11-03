import { readFile } from 'node:fs/promises';
import path from 'node:path';
import postcss from 'postcss';
import { describe, expect, it } from 'vitest';

const stylesPath = path.join(process.cwd(), 'src', 'features', 'demo', 'demo.module.css');

describe('encuadre de fotografías de demostración', () => {
  it('limita cada foto al marco y conserva toda la imagen', async () => {
    const stylesheet = postcss.parse(await readFile(stylesPath, 'utf8'));
    const declarationsFor = (selector: string) => {
      const rule = stylesheet.nodes.find((node) => node.type === 'rule' && node.selector === selector);
      if (!rule || rule.type !== 'rule') throw new Error(`Falta la regla ${selector}.`);
      return new Map(rule.nodes.filter((node) => node.type === 'decl').map((node) => [node.prop, node.value]));
    };

    expect(declarationsFor('.cardPhoto').get('position')).toBe('relative');

    const image = declarationsFor('.cardPhoto img');
    expect(image.get('position')).toBe('absolute');
    expect(image.get('inset')).toBe('0');
    expect(image.get('width')).toBe('100%');
    expect(image.get('height')).toBe('100%');
    expect(image.get('object-fit')).toBe('contain');
  });
});
