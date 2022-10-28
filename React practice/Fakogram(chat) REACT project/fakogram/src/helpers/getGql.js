import { backURL } from '../constants'

const getGQL =
    (url) =>
    async (query, variables = {}) => {
        const incomingData = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(localStorage.authToken
                    ? { Authorization: 'Bearer ' + localStorage.authToken }
                    : {}),
            },
            body: JSON.stringify({ query, variables }),
        })
        const obj = await incomingData.json()
        if (!obj.data && obj.errors) {
            throw new Error(JSON.stringify(obj.errors))
        } else {
            return obj.data[Object.keys(obj.data)[0]]
        }
    }

export const gql = getGQL(backURL + 'graphql')
