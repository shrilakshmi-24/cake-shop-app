'use server';

import dbConnect from '@/lib/db/connect';
import Order from '@/lib/db/models/Order';
import { auth } from '@/auth';

export async function getAnalyticsData() {
    try {
        const session = await auth();
        // Strict Admin Check
        if (!session?.user || (session.user as any).role !== 'admin') {
            throw new Error('Unauthorized');
        }

        await dbConnect();

        // 1. Headline Metrics
        const totalStats = await Order.aggregate([
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$finalPrice" },
                    totalOrders: { $sum: 1 },
                    avgOrderValue: { $avg: "$finalPrice" }
                }
            }
        ]);

        const stats = totalStats[0] || { totalRevenue: 0, totalOrders: 0, avgOrderValue: 0 };

        // 2. Status Distribution
        const statusDist = await Order.aggregate([
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            }
        ]);

        // 3. Orders Last 7 Days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        const dailyOrders = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: sevenDaysAgo }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 },
                    revenue: { $sum: "$finalPrice" }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // 4. Popular Flavors
        const popularFlavors = await Order.aggregate([
            {
                $group: {
                    _id: "$customizationSnapshot.flavor",
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);

        return {
            stats: {
                revenue: stats.totalRevenue,
                orders: stats.totalOrders,
                avgValue: stats.avgOrderValue
            },
            statusData: statusDist.map(s => ({ status: s._id, count: s.count })),
            dailyData: dailyOrders.map(d => ({ date: d._id, count: d.count, revenue: d.revenue })),
            popularFlavors: popularFlavors.map(f => ({ flavor: f._id, count: f.count }))
        };

    } catch (error) {
        console.error('Analytics Error:', error);
        return null;
    }
}
