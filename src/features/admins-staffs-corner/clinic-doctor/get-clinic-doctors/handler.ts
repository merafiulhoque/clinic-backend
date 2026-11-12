import {Request, Response} from "express";
import {AppError} from "shared/utilities/errorHandler.js";
import {getClinicDoctorsService} from "features/admins-staffs-corner/clinic-doctor/get-clinic-doctors/service.js";

export const getClinicDoctorsHandler = async (
    req: Request,
    res: Response
)=> {
    const user = req.user
    if(!user) throw  new AppError(401, "unauthorized");

    const clinicId = req.params.clinicId;

    if(Number.isNaN(clinicId)) throw  new AppError(401, "Invalid request url");
    if(typeof Number(clinicId) !== "number") throw  new AppError(401, "Invalid request url");

    const allClinicsWithDoctors = await  getClinicDoctorsService(user.id, 2)
    return res.status(200).send(allClinicsWithDoctors);
}
