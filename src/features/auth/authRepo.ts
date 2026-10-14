import { prisma } from "shared/clients/prisma.js"
import { userSignupData } from "./schema.js"

export const emailExists = async (
    data: userSignupData
) => {
    return !!(await prisma.user.findUnique({
        where: {
            email: data.email
        },
        select: {
            id: true
        }
    }))
}

export const createUser = async (data: userSignupData) => {
    return await prisma.user.create({
        data: {
            email: data.email,
            passwordHash: data.password
        },
        select: {
            id: true
        }
    })
}

export const getUserByEmail = async (
    email: string
) => {
    return prisma.user.findUnique({
        where: { email },
        select: { id: true, passwordHash: true }
    })
}