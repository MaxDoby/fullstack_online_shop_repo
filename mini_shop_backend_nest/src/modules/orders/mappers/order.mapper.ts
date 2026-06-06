import type { OrderResponseDto } from '../dto/order-response.dto';

type OrderWithItems = {
  id: number;
  userId: number;
  totalCost: number;
  status: string;
  createdAt: Date;
  orderItems: {
    id: number;
    productId: number;
    quantity: number;
    priceAtPurchase: number;
    product: {
      title: string;
      thumbnail: string;
    };
  }[];
};

export class OrderMapper {
  public static toResponse(order: OrderWithItems): OrderResponseDto {
    return {
      id: order.id,
      userId: order.userId,
      totalCost: order.totalCost,
      status: order.status,
      createdAt: order.createdAt,
      orderItems: order.orderItems.map((item) => ({
        id: item.id,
        productId: item.productId,
        productTitle: item.product.title,
        productThumbnail: item.product.thumbnail,
        quantity: item.quantity,
        priceAtPurchase: item.priceAtPurchase,
      })),
    };
  }

  public static toResponseList(orders: OrderWithItems[]): OrderResponseDto[] {
    return orders.map((order) => this.toResponse(order));
  }
}
