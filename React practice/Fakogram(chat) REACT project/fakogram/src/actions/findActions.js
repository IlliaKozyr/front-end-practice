import { gql } from '../helpers'
import { actionPromise } from '../reducers'

export const actionFindUsers = (text, skipCount = 0, limitCount = 20) =>
    actionPromise(
        'findUsers',
        gql(
            `query findUsers($q: String) {
      UserFind (query: $q){
         _id
         createdAt
         login
         nick
         avatar {
            _id
            url
         }
      }     
   }`,
            {
                q: JSON.stringify([
                    {
                        $or: [{ login: `/${text}/` }, { nick: `/${text}/` }],
                    },
                    {
                        sort: [{ login: 1 }],
                        skip: [skipCount],
                        limit: [limitCount],
                    },
                ]),
            }
        )
    )

// поиск чатов конкретного юзера по названию
export const actionFindChatsByUser = (
    userId,
    word,
    skipCount = 0,
    limitCount = 20
) =>
    actionPromise(
        'findChatsByUser',
        gql(
            `query findChatsByUser($q: String) {
      ChatFind (query: $q){
         _id
         _id
         title
         avatar {
            _id
            url
         }
         owner {
            _id
            login
            avatar {
               _id
               url
            }
         }
         members {
            _id
            login
            nick
            avatar {
               _id
               url
            }
         }
         lastModified  
      }     
   }`,
            {
                q: JSON.stringify([
                    {
                        title: `/${word}/`,
                        $or: [{ ___owner: userId }, { 'members._id': userId }],
                    },
                    {
                        sort: [{ title: 1 }],
                        skip: [skipCount],
                        limit: [limitCount],
                    },
                ]),
            }
        )
    )

// можно добавить еще поиск чатов по мемберам
