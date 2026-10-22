import { isUserAnOwner } from "shared/repository/sharedRepo.js"
import { AppError } from "shared/utilities/errorHandler.js"
import { getDoctorsList } from "../doctorRepo.js"

export const getDoctorsListService = async (
    userId: number
) => {
    const userAnOwner = !!(await isUserAnOwner(userId))

    if (!userAnOwner) throw new AppError(
        403, "access denied"
    )

    const lists = await getDoctorsList(userId)

    console.log(lists)

    const normalizedList = lists.map( list => ({
        doctorId: list.id,
        fullName: list.firstName + " " +list.middleName + " "+  list.lastName,
        clinics: list.doctorClinics.map(clinic => ({
            clinicId: clinic.clinicId,
            clinicName: clinic.clinics.name,
            clinicLocation: clinic.clinics.location
        }))
    }))
    return normalizedList
}