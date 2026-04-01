import Category from '../models/Category';
import { generateSlug } from '../utils/helpers';

interface SeedCategory {
  name: string;
  children?: SeedCategory[];
}

const categoryTree: SeedCategory[] = [
  {
    name: 'Roofing',
    children: [
      { name: 'Roof Sheets' },
      { name: 'Roofing Accessories' },
      { name: 'Polycarbonate Sheets' },
    ],
  },
  {
    name: 'Cladding',
    children: [
      { name: 'Cladding Panels' },
      { name: 'Cladding Accessories' },
    ],
  },
  {
    name: 'Fascia & Gutter',
    children: [
      { name: 'Fascia & Gutter Products' },
      { name: 'Fascia Accessories' },
      {
        name: 'Gutter Accessories',
        children: [
          { name: 'Quad' },
          { name: 'Flatback' },
          { name: 'Squarline' },
          { name: 'OG' },
          { name: 'Half Flatback' },
        ],
      },
    ],
  },
  {
    name: 'Downpipe',
    children: [
      { name: 'Downpipes' },
      // { name: 'Downpipe Accessories' },
      { name: 'Downpipe Clips' },
      { name: 'Downpipe Offsets' },
      { name: 'Pops' },
    ],
  },
  {
    name: 'Flashing',
  },
  {
    name: 'Rainwater Goods',
    children: [
      { name: 'Rainheads & Sumps' },
      { name: 'Dambuster Products' },
    ],
  },
  {
    name: 'Accessories',
    children: [
      { name: 'Screws' },
      { name: 'Insulations' },
    ],
  },
];

export const seedCategories = async () => {
  let count = 0;

  for (let i = 0; i < categoryTree.length; i++) {
    const cat = categoryTree[i];
    const slug = generateSlug(cat.name);

    const root = await Category.findOneAndUpdate(
      { slug },
      { name: cat.name, slug, level: 0, sortOrder: i, isActive: true, parent: null },
      { upsert: true, new: true }
    );
    count++;

    if (cat.children) {
      for (let j = 0; j < cat.children.length; j++) {
        const child = cat.children[j];
        const childSlug = generateSlug(child.name);

        const childDoc = await Category.findOneAndUpdate(
          { slug: childSlug },
          { name: child.name, slug: childSlug, level: 1, sortOrder: j, isActive: true, parent: root._id },
          { upsert: true, new: true }
        );
        count++;

        if (child.children) {
          for (let k = 0; k < child.children.length; k++) {
            const grandchild = child.children[k];
            const grandSlug = generateSlug(grandchild.name);

            await Category.findOneAndUpdate(
              { slug: grandSlug },
              { name: grandchild.name, slug: grandSlug, level: 2, sortOrder: k, isActive: true, parent: childDoc._id },
              { upsert: true, new: true }
            );
            count++;
          }
        }
      }
    }
  }

  console.log(`Seeded ${count} categories`);
};
