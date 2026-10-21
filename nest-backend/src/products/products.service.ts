import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { CreateProductInput } from './dto/create-product.input';
import { UpdateProductInput } from './dto/update-product.input';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(input: CreateProductInput): Promise<Product> {
    const clean: Partial<Product> = {};
    for (const key of Object.keys(input)) {
      const value = input[key as keyof CreateProductInput];
      if (value !== undefined) {
        (clean as Record<string, unknown>)[key] = value;
      }
    }
    const product = this.productRepository.create(clean);
    return this.productRepository.save(product);
  }

  async findAll(): Promise<Product[]> {
    return this.productRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }
    return product;
  }

  async update(id: number, input: UpdateProductInput): Promise<Product> {
    const product = await this.findOne(id);
    for (const key of Object.keys(input)) {
      const value = input[key as keyof UpdateProductInput];
      if (value !== undefined) {
        (product as unknown as Record<string, unknown>)[key] = value;
      }
    }
    return this.productRepository.save(product);
  }

  async remove(id: number): Promise<boolean> {
    const result = await this.productRepository.delete(id);
    if (!result.affected) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }
    return true;
  }
}
