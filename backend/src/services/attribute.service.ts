import Attribute, { IAttribute, IAttributeValue } from '../models/Attribute';
import { ApiError } from '../utils/ApiError';
import { generateSlug } from '../utils/helpers';

export const attributeService = {
  async getAll() {
    return Attribute.find().sort({ sortOrder: 1, name: 1 });
  },

  async getFilterable() {
    return Attribute.find({ isFilterable: true }).sort({ sortOrder: 1 });
  },

  async getById(id: string) {
    const attr = await Attribute.findById(id);
    if (!attr) throw ApiError.notFound('Attribute not found');
    return attr;
  },

  async create(data: Partial<IAttribute>) {
    const slug = data.slug || generateSlug(data.name!);
    const existing = await Attribute.findOne({ slug });
    if (existing) throw ApiError.conflict('Attribute with this name already exists');
    return Attribute.create({ ...data, slug });
  },

  async update(id: string, data: Partial<IAttribute>) {
    const attr = await Attribute.findById(id);
    if (!attr) throw ApiError.notFound('Attribute not found');

    if (data.name && data.name !== attr.name && !data.slug) {
      data.slug = generateSlug(data.name);
    }

    return Attribute.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  },

  async delete(id: string) {
    return Attribute.findByIdAndDelete(id);
  },

  async addValue(id: string, value: IAttributeValue) {
    const attr = await Attribute.findById(id);
    if (!attr) throw ApiError.notFound('Attribute not found');

    const exists = attr.values.some((v) => v.value === value.value);
    if (exists) throw ApiError.conflict('Value already exists');

    attr.values.push(value);
    return attr.save();
  },

  async removeValue(id: string, value: string) {
    const attr = await Attribute.findById(id);
    if (!attr) throw ApiError.notFound('Attribute not found');

    attr.values = attr.values.filter((v) => v.value !== value);
    return attr.save();
  },
};
