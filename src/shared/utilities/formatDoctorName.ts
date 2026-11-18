export const formatDoctorName = (
  data: {
    firstName: string,
    middleName: string | null,
    lastName: string | null
  }
) => {
  return [
    data.firstName, data.middleName, data.lastName
    ].filter(Boolean).join(" ")
}
