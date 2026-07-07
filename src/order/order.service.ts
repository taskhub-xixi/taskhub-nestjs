import { HttpException, Inject, Injectable } from "@nestjs/common";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { randomInt } from "node:crypto";
import { Logger } from "winston";
import { JwtPayload } from "../auth/interfaces/payload-interface";
import { PrismaService } from "../common/prisma.service";
import {
  CreateOrderRequest,
  GetAllOrderResponse,
  GetOrderRequestService,
  GetOrderResponse,
  OrderQueryResponse,
  OrderResponse,
  OrderResponseQuery,
  PaymentsResponseFromGetOrderResponse,
} from "./order.model";

@Injectable()
export class OrderService {
  constructor(
    private readonly prismaService: PrismaService,
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
  ) { }

  async createOrder(
    req: CreateOrderRequest,
    payload: JwtPayload,
  ): Promise<OrderResponse> {
    this.logger.info(`ORDER_SERVICE.createOrder: ...`);
    const user = await this.prismaService.users.findUnique({
      where: { email: payload.email },
    });

    if (!user) {
      throw new HttpException("User not found", 404);
    }
    if (!payload.sub) {
      throw new HttpException("Payload sub undefind", 403);
    }

    const odn = payload.sub + randomInt(99999999);

    const orderCreate = await this.prismaService.order.create({
      data: {
        orderNumber: "ORD-" + odn,
        userId: user.id,
        subtotal: req.subtotal,
        shippingCost: req.shippingCost,
        discount: req.discount,
        tax: req.tax,
        total: req.total,
        shippingAddress: req.shippingAddress,
      },
    });

    const orderResult = await this.prismaService.$queryRaw<OrderResponseQuery>`
    select
      o.id,
      o.order_number,
      o.status,
      o.subtotal,
      o.shipping_cost,
      o.discount,
      o.tax,
      o.total,
      o.created_at,
      oi.id as order_item_id,
      oi.quantity as order_item_quantity,
      oi.price as order_item_price,
      oi.subtotal as order_item_subtotal,
      p.method as payment_method,
      p.amount as payment_amount,
      p.status as payment_status,
      p.deadline as payment_deadline
    from
      orders as o
      left join order_items as oi on oi.order_id = o.id
      left join payments as p on p.order_id = o.id
    where o.id = ${orderCreate.id}`;

    if (!orderResult) {
      throw new HttpException("User not found", 404);
    }

    return {
      data: {
        id: orderResult.id,
        orderNumber: orderResult.order_number,
        status: orderResult.status,
        items: {
          id: orderResult.order_item_id,
          quantity: orderResult.order_item_quantity,
          price: orderResult.order_item_price,
          subtotal: orderResult.order_item_subtotal,
        },
        subtotal: orderResult.subtotal,
        shippingCost: orderResult.shippingCost,
        discount: orderResult.discount,
        tax: orderResult.tax,
        total: orderResult.total,
        payment: {
          method: orderResult.payment_method,
          status: orderResult.payment_status,
          amount: orderResult.payment_amount,
          deadline: orderResult.payment_deadline,
        },
        createdAt: orderResult.createdAt,
      },
    };
  }

  // unf -> join
  async getAllOrders(): Promise<GetAllOrderResponse> {
    const result = await this.prismaService.order.findMany();
    return {
      orders: result,
    };
  }

  async getOrderById(req: GetOrderRequestService): Promise<GetOrderResponse> {
    if (!req.params.id || req.params.id === undefined) {
      throw new HttpException("User Id not found", 403);
    }

    const u = await this.prismaService.$queryRaw<
      OrderQueryResponse[]
    >`SELECT * FROM orders WHERE id = ${req.params.id}`;

    if (!u) {
      throw new HttpException("Order not found", 403);
    }

    const user = u[0];

    const productOrderJoin = await this.prismaService.orderItem.findFirst({
      where: { orderId: user.id },
    });

    const paymentOrderJoin = await this.prismaService
      .$queryRaw<PaymentsResponseFromGetOrderResponse>`
      SELECT p.method, p.status, p.amount, p.deadline 
      from orders as o 
      left join payments as p on p.order_id = o.id 
      where o.id = ${user.id}`;

    if (!productOrderJoin) {
      throw new HttpException("product not found", 403);
    }

    return {
      id: user.id,
      orderNumber: user.order_number,
      status: user.status,
      items: [
        {
          productId: productOrderJoin.productId,
          variantId: productOrderJoin.variantId || "null",
          quantity: productOrderJoin.quantity,
          price: productOrderJoin.price,
        },
      ],
      subtotal: user.subtotal,
      shippingCost: user.shipping_cost,
      discount: user.discount,
      tax: user.tax,
      total: user.total,
      shippingMethod: user.shipping_method || "null",
      shippingAddress: user.shipping_address,
      payment: {
        method: paymentOrderJoin.method,
        status: paymentOrderJoin.status,
        amount: paymentOrderJoin.amount,
        deadline: paymentOrderJoin.deadline,
      },
      createdAt: user.created_at,
    };
  }

  async getOrderWithCoupons(coupons_id: number) {
    const result = await this.prismaService
      .$queryRaw`select * from orders as o left join coupons as c on c.id = o.coupon_id where o.coupon_id = ${coupons_id}`;
    return result;
  }
}
