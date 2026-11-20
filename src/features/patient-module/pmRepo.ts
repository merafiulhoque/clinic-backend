import { AppointmentStatus } from "generated/prisma/enums.js"
import { prisma } from "shared/clients/prisma.js"

import { viewAppointmentFilterType } from "./schemas.js";
import { Prisma } from "generated/prisma/client.js";

export const viewAppointments = async (
  clinicId: number,
  filter: viewAppointmentFilterType
) => {
  const dateFilter: Prisma.DateTimeFilter = {};

  switch (filter.type) {
    case "today": {
      const today = new Date();
    
      const start = new Date(Date.UTC(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      ));
      const end = new Date(start);
      end.setUTCDate(end.getUTCDate() + 1);
    
      dateFilter.gte = start;
      dateFilter.lt = end;
      break;
    } 

    case "range": {
      dateFilter.gte = new Date(filter.from);
      dateFilter.lte = new Date(filter.to);
      break;
    }

    case "all":
      break;
  }

  return prisma.appointment.findMany({
    where: {
      ...(filter.type !== "all" && { appointmentDate: dateFilter }),

      status: {
        in: [AppointmentStatus.CONFIRMED, AppointmentStatus.PENDING],
      },

      doctorSchedule: {
        doctorClinic: {
          clinicId,
        },
      },
    },

    select: {
      id: true,
      patientName: true,
      appointmentDate: true,
      startTime: true,
      status: true,

      doctorSchedule: {
        select: {
          doctorClinic: {
            select: {
              doctor: {
                select: {
                  firstName: true,
                  middleName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      },
    },

    take: filter.limit,
    skip: (filter.page - 1) * filter.limit,

    orderBy: [
      { appointmentDate: "asc" },
      { startTime: "asc" },
    ],
  });
};
