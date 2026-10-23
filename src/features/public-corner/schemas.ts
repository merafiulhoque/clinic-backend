import { z } from "zod";

export const publicDoctorSearchSchema = z.object({
  clinicName: z.string().trim().min(1).optional(),
  doctorName: z.string().trim().min(1).optional(),
  location: z.string().trim().min(1).optional(),
  speciality: z.string().trim().min(1).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type PublicDoctorSearchData = z.infer<
  typeof publicDoctorSearchSchema
>;

export type rawDoctorsList = {
    id: number;
    firstName: string;
    middleName: string | null;
    lastName: string | null;
    qualification: string | null;
    additionalQualification: string | null;
    specialization: string | null;
    doctorClinics: {
        clinics: {
            location: string;
            id: number;
            name: string;
        };
        fees: number;
    }[]
}

export type Clinic = {
    id: number,
    location: string,
    name: string
}

export type normalizedDoctorList = {
    id: number,
    name: string,
    qualification: string | null,
    additionalQualification: string | null,
    specialization: string | null,
    clinics: {
        clinicId: number,
        clinicName: string,
        clinicLocation: string
        fees: number
    }[]
}