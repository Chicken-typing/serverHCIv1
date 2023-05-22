import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import Order from '../models/orderModel.js';
import User from '../models/userModel.js';
import Product from '../models/productModel.js';
import isAdmin from "../utils/isAdmin.js";
import isAuthenticated from "../utils/isAuthenticated.js";

const orderRoute = express.Router();

orderRoute.get(
  '/',
  isAuthenticated,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const orders = await Order.find().populate('user', 'username');
    res.send(orders);
  })
);

orderRoute.post(
  '/',
  isAuthenticated,
  expressAsyncHandler(async (req, res) => {
    const newOrder = new Order({
      orderItems: req.body.orderItems.map((x) => ({ ...x, product: x._id })),
      shippingAddress: req.body.shippingAddress,
      paymentMethod: req.body.paymentMethod,
      itemsPrice: req.body.itemsPrice,
      shippingPrice: req.body.shippingPrice,
      taxPrice: req.body.taxPrice,
      totalPrice: req.body.totalPrice,
      user: req.user._id,
      paymentResult: { ...req.body.paymentResult },
      isPaid: req.body.paymentResult.status === "COMPLETED" ? true : false,
    });

    const order = await newOrder.save();
    res.status(201).send({ message: 'New Order Created', order });
  })
);

orderRoute.get(
  '/summary',
  isAuthenticated,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const orders = await Order.aggregate([
      {
        $group: {
          _id: null,
          numOrders: { $sum: 1 },
          totalSales: { $sum: '$totalPrice' },
        },
      },
    ]);
    const users = await User.aggregate([
      {
        $group: {
          _id: null,
          numUsers: { $sum: 1 },
        },
      },
    ]);
    const dailyOrders = await Order.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          orders: { $sum: 1 },
          sales: { $sum: '$totalPrice' },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    const manCategories = await Product.aggregate([
      {
        $match: {category: 'man'}
      },
      {
        $group: {
          _id: null,
          type: {$first: 'Man'},
          value: { $sum: 1 },
        },
      },
    ]);
    const womanCategories = await Product.aggregate([
      {
        $match: {category: 'woman'}
      },
      {
        $group: {
          _id: null,
          type: {$first: 'Woman'},
          value: { $sum: 1 },
        },
      },
    ]);
    const kidCategories = await Product.aggregate([
      {
        $match: {category: 'kid'}
      },
      {
        $group: {
          _id: null,
          type: {$first: 'Kid'},
          value: { $sum: 1 },
        },
      },
    ]);
    const productCategories = [...manCategories, ...womanCategories,...kidCategories];
    res.send({ users, orders, dailyOrders, productCategories });
  })
);


orderRoute.get(
  '/mine',
  isAuthenticated,
  expressAsyncHandler(async (req, res) => {
    const orders = await Order.find({ user: req.user._id });
    res.send(orders);
  })
);

orderRoute.get(
  '/:id',
  isAuthenticated,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (order) {
      res.send(order);
    } else {
      res.status(404).send({ message: 'Order Not Found' });
    }
  })
);

orderRoute.put(
  '/:id/deliver',
  isAuthenticated,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (order) {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
      await order.save();
      res.send({ message: 'Order Delivered' });
    } else {
      res.status(404).send({ message: 'Order Not Found' });
    }
  })
);

orderRoute.put(
  '/:id/pay',
  isAuthenticated,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (order) {
      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentResult = {
        id: req.body.id,
        status: req.body.status,
        update_time: req.body.update_time,
        email_address: req.body.email_address,
      };
      for (const index in order.orderItems) {
        const item = order.orderItems[index];     
        const product = await Product.findById(item.product);     
        product.countInStock -= item.quantity;  
        await product.save();
        }
      const updatedOrder = await order.save();
      res.send({ message: 'Order Paid', order: updatedOrder });
    } else {
      res.status(404).send({ message: 'Order Not Found' });
    }
  })
);

orderRoute.delete(
  '/:id',
  isAuthenticated,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (order) {
      await order.remove();
      res.send({ message: 'Order Deleted' });
    } else {
      res.status(404).send({ message: 'Order Not Found' });
    }
  })
);

export default orderRoute;
