import { Prisma } from '@prisma/client';
import { prisma } from '../config/db.js';

type TransactionClient = Prisma.TransactionClient | typeof prisma;

export class InventoryService {
  /**
   * Increase product stock and record an IN movement.
   */
  static async increaseStock(
    client: TransactionClient,
    productId: string,
    quantity: number,
    reason: string,
    userId: string
  ) {
    if (quantity <= 0) {
      throw new Error('Increase quantity must be positive');
    }

    const product = await client.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new Error(`Product not found with ID ${productId}`);
    }

    const updatedProduct = await client.product.update({
      where: { id: productId },
      data: {
        currentStock: {
          increment: quantity,
        },
      },
    });

    await client.stockMovement.create({
      data: {
        productId,
        quantityChanged: quantity,
        type: 'IN',
        reason,
        createdById: userId,
      },
    });

    return updatedProduct;
  }

  /**
   * Decrease product stock and record an OUT movement.
   * Throws an error if stock is insufficient to prevent negative inventory.
   */
  static async decreaseStock(
    client: TransactionClient,
    productId: string,
    quantity: number,
    reason: string,
    userId: string
  ) {
    if (quantity <= 0) {
      throw new Error('Decrease quantity must be positive');
    }

    const product = await client.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new Error(`Product not found with ID ${productId}`);
    }

    if (product.currentStock < quantity) {
      throw new Error(
        `Insufficient stock for product ${product.name} (${product.sku}). Available: ${product.currentStock}, Requested: ${quantity}.`
      );
    }

    const updatedProduct = await client.product.update({
      where: { id: productId },
      data: {
        currentStock: {
          decrement: quantity,
        },
      },
    });

    await client.stockMovement.create({
      data: {
        productId,
        quantityChanged: quantity,
        type: 'OUT',
        reason,
        createdById: userId,
      },
    });

    return updatedProduct;
  }
}
