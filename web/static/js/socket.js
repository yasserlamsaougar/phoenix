import { Socket } from "phoenix"

let socket = new Socket("/socket", { params: { token: window.discuss.userToken } })

socket.connect()

function renderComment({ content, user }) {
  const email = (user && user.email) || 'Anonymous'
  return `
  <li class="collection-item">
    ${content}
    <div class="secondary-content">
      ${email}
    </div>
  </li>
`
}

function renderComments({ comments }) {
  const commentsHTML = comments.map(renderComment)
  document.getElementById('comments-list').innerHTML = commentsHTML.join('')

}

const createSocket = (topicId) => {
  // Now that you are connected, you can join channels with a topic:
  let channel = socket.channel(`comments:${topicId}`, {})
  channel.join()
    .receive("ok", renderComments)
    .receive("error", resp => { console.log("Unable to join", resp) })

  document.getElementById('comment-submit-btn').addEventListener('click', () => {
    const content = document.getElementById('comment-content').value
    channel.push('comment:add', { content: content })
  })

  channel.on(`comments:${topicId}:new`, ({ comment }) => {
    const commentHTML = renderComment(comment)
    document.getElementById('comments-list').innerHTML += commentHTML
  })

}

window.discuss = window.discuss || {}
window.discuss.createSocket = createSocket