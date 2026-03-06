import { prisma } from "../../shared/prisma";

export interface DashboardStats {
  companiesCount: number;
  parkingsCount: number;
  vehiclesCount: number;
  ticketsCount: number;
  usersCount: number;
  bookingsCount: number;
  ticketsLast7Days: { date: string; count: number }[];
  recentTickets: Array<{
    id: string;
    status: string;
    entryTime: Date | null;
    parking?: { name: string };
    vehicle?: { plate: string; brand: string; model: string };
  }>;
}

export class DashboardService {
  static async getStats(companyId: string | null): Promise<DashboardStats> {
    const isGlobal = !companyId;
    const where = isGlobal ? {} : { companyId };

    const companyWhere = isGlobal ? {} : { companyId: companyId! };
    const [companiesCount, parkingsCount, vehiclesCount, ticketsCount, usersCount, bookingsCount, ticketsLast7Days, recentTickets] =
      await Promise.all([
        isGlobal ? prisma.company.count() : Promise.resolve(0),
        prisma.parking.count({ where: companyWhere }),
        prisma.vehicle.count({ where: companyWhere }),
        prisma.ticket.count({ where: companyWhere }),
        prisma.user.count({
          where: isGlobal ? { valet: null } : { companyId: companyId!, valet: null },
        }),
        prisma.booking.count({ where: companyWhere }),
        this.getTicketsByDay(companyId, 7),
        this.getRecentTickets(companyId, 5),
      ]);

    return {
      companiesCount,
      parkingsCount,
      vehiclesCount,
      ticketsCount,
      usersCount,
      bookingsCount,
      ticketsLast7Days,
      recentTickets,
    };
  }

  private static async getTicketsByDay(
    companyId: string | null,
    days: number
  ): Promise<{ date: string; count: number }[]> {
    const start = new Date();
    start.setDate(start.getDate() - days);
    start.setHours(0, 0, 0, 0);

    const where = companyId
      ? { companyId, entryTime: { gte: start } }
      : { entryTime: { gte: start } };

    const tickets = await prisma.ticket.findMany({
      where,
      select: { entryTime: true },
    });

    const byDay: Record<string, number> = {};
    for (let i = 0; i < days; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      byDay[d.toISOString().slice(0, 10)] = 0;
    }
    for (const t of tickets) {
      if (t.entryTime) {
        const key = new Date(t.entryTime).toISOString().slice(0, 10);
        if (key in byDay) byDay[key]++;
      }
    }

    return Object.entries(byDay)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count }));
  }

  private static async getRecentTickets(companyId: string | null, limit: number) {
    const where = companyId ? { companyId } : {};
    return prisma.ticket.findMany({
      where,
      orderBy: { entryTime: "desc" },
      take: limit,
      select: {
        id: true,
        status: true,
        entryTime: true,
        parking: { select: { name: true } },
        vehicle: { select: { plate: true, brand: true, model: true } },
      },
    });
  }
}
