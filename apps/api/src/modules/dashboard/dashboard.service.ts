import { prisma } from "../../shared/prisma";

export interface DashboardStats {
  companiesCount: number;
  parkingsCount: number;
  vehiclesCount: number;
  valetsCount: number;
  customersCount: number;
  ticketsCount: number;
  usersCount: number;
  bookingsCount: number;
  /** Whether the company (or system for superAdmin) has at least one parking requiring booking */
  hasParkingWithBooking: boolean;
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
  static async getStats(
    companyId: string | null,
    days: number = 7,
    from?: string,
    to?: string
  ): Promise<DashboardStats> {
    const isGlobal = !companyId;

    const companyWhere = isGlobal ? {} : { companyId: companyId! };
    const ticketsByDay = (from != null && to != null)
      ? await this.getTicketsByDayRange(companyId, from, to)
      : await this.getTicketsByDay(companyId, days);

    const [companiesCount, parkingsCount, vehiclesCount, valetsCount, customersCount, ticketsCount, usersCount, bookingsCount, hasParkingWithBooking, recentTickets] =
      await Promise.all([
        isGlobal ? prisma.company.count() : Promise.resolve(0),
        prisma.parking.count({ where: companyWhere }),
        prisma.vehicle.count({ where: companyWhere }),
        prisma.valet.count({ where: companyWhere }),
        isGlobal ? prisma.user.count({ where: { systemRole: "CUSTOMER" } }) : prisma.user.count({ where: { companyId: companyId!, systemRole: "CUSTOMER" } }),
        prisma.ticket.count({ where: companyWhere }),
        prisma.user.count({
          where: isGlobal ? { valet: null } : { companyId: companyId!, valet: null },
        }),
        prisma.booking.count({ where: companyWhere }),
        this.hasParkingWithBooking(companyId),
        this.getRecentTickets(companyId, 5),
      ]);

    return {
      companiesCount,
      parkingsCount,
      vehiclesCount,
      valetsCount,
      customersCount,
      ticketsCount,
      usersCount,
      bookingsCount,
      hasParkingWithBooking,
      ticketsLast7Days: ticketsByDay,
      recentTickets,
    };
  }

  /** True if the company (or any, for superAdmin) has app channel enabled (bookings enabled). */
  private static async hasParkingWithBooking(companyId: string | null): Promise<boolean> {
    if (companyId) {
      const company = await prisma.company.findUnique({
        where: { id: companyId },
        select: { requiresCustomerApp: true },
      });
      return company?.requiresCustomerApp ?? false;
    }
    const first = await prisma.company.findFirst({
      where: { requiresCustomerApp: true },
      select: { id: true },
    });
    return first != null;
  }

  private static async getTicketsByDay(
    companyId: string | null,
    days: number
  ): Promise<{ date: string; count: number }[]> {
    const now = new Date();
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - (days - 1), 0, 0, 0, 0));
    const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));
    return this.getTicketsByDayRange(
      companyId,
      start.toISOString().slice(0, 10),
      end.toISOString().slice(0, 10)
    );
  }

  /** YYYY-MM-DD date range; max 90 days. Inclusive dates: from and to are first and last chart day. */
  private static async getTicketsByDayRange(
    companyId: string | null,
    from: string,
    to: string
  ): Promise<{ date: string; count: number }[]> {
    const [y1, m1, d1] = from.split("-").map(Number);
    const [y2, m2, d2] = to.split("-").map(Number);
    // Start of first day and end of last day in UTC for filtering
    const start = new Date(Date.UTC(y1, m1 - 1, d1, 0, 0, 0, 0));
    const end = new Date(Date.UTC(y2, m2 - 1, d2, 23, 59, 59, 999));
    if (start.getTime() > end.getTime()) {
      return [];
    }
    const totalDays = Math.ceil((end.getTime() - start.getTime()) / 86400000) + 1;
    const maxDays = 90;
    const effectiveEnd =
      totalDays > maxDays ? new Date(start.getTime() + (maxDays - 1) * 86400000) : end;
    const effectiveEndStr = effectiveEnd.toISOString().slice(0, 10);

    const where = companyId
      ? { companyId, entryTime: { gte: start, lte: effectiveEnd } }
      : { entryTime: { gte: start, lte: effectiveEnd } };

    const tickets = await prisma.ticket.findMany({
      where,
      select: { entryTime: true },
    });

    // Build the range keys exactly from `from` through effectiveEnd (inclusive)
    // so the chart matches the selected days without offsets.
    const byDay: Record<string, number> = {};
    let cursor = new Date(Date.UTC(y1, m1 - 1, d1, 12, 0, 0, 0)); // UTC noon avoids edge cases
    const endCursor = new Date(Date.UTC(
      parseInt(effectiveEndStr.slice(0, 4), 10),
      parseInt(effectiveEndStr.slice(5, 7), 10) - 1,
      parseInt(effectiveEndStr.slice(8, 10), 10),
      12,
      0,
      0,
      0
    ));
    while (cursor.getTime() <= endCursor.getTime()) {
      byDay[cursor.toISOString().slice(0, 10)] = 0;
      cursor = new Date(cursor.getTime() + 86400000);
    }

    for (const t of tickets) {
      if (t.entryTime) {
        const d = new Date(t.entryTime);
        const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
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
