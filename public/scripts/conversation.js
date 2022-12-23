function ready(callback) {
  // in case the document is already rendered
  if (document.readyState != 'loading') callback();
  // modern browsers
  else if (document.addEventListener) document.addEventListener('DOMContentLoaded', callback);
  // IE <= 8
  else document.attachEvent('onreadystatechange', function() {
    if (document.readyState == 'complete') callback();
  });
}

ready(async() => {
  try {

    var blog_url = document.getElementById("script_conversation").getAttribute("data-blog_url");

    var styleEl = document.createElement('style');
    styleEl.innerHTML = `#conversations img{ 
      float: left; 
      margin-right: 10px; 
    }
    #conversations a {
      text-decoration: none;
      font-weight: bold;      
    }
    #conversations .p-name{ 
      font-weight: bold; 
    }
    #conversations p{ 
      margin: 0;
      margin-top: .8em;
    }
    #conversations .date, #conversations .date a{
      font-size: 0.8em;
      color: #999;
      padding: 0;
      margin: 0;      
      text-transform: none !important;
    }
    #conversations .mention{
      margin-bottom: 30px;
    }
    #conversations .webmention-form label{
      display: block;
      clear: both;      
      font-size: 1.0em;      
    }
    #conversations .webmention-form input[type=url]{
      display: block;
      width: 100%;
      font-size: 1.0em;
      padding: 0.5em;
      float: left;
    }
    #conversations .webmention-form input[type=submit]{
      display: block;      
      font-size: 1.0em;
      padding: 0.5em;
      float: right;
    }
    #conversations .clear{
      clear: both;
    }
    `;
    document.head.appendChild(styleEl);

    const conversationsDiv = document.getElementById('conversations');
    if (!conversationsDiv) {
      console.log('This theme does not support conversations. Add a div with the id conversations to your page.');
      return;
    }

    conversationsDiv.innerHTML = `
      <br /><hr />
      <form class="webmention-form" action="https://webmention.io/${blog_url}/webmention" method="post">
      
        <label>Have you written a <a href="https://indieweb.org/responses">response</a> to this? Let me know the URL:</label>
        <input type="url" name="source" class="url">
        <div>
          <label>&nbsp;</label>
          <input type="submit" class="ui submit button" value="Send Webmention">
        </div>      
      <div class="status hidden">
        <div class="ui message"></div>
      </div>
      <input type="hidden" name="target" value="${window.location.href}">
    </form>
    <div class="clear"></div>
    `

    let target = encodeURIComponent(window.location.href);
    let url = `https://webmention.io/api/mentions.jf2?target=${target}`
    const response = await fetch(url);
    let data = await response.json();

    // If there was a slash at the end of target, try again without it
    if (target.endsWith('/')) {
      target = target.slice(0, -1);
      url = `https://webmention.io/api/mentions.jf2?target=${target}`
      const response = await fetch(url);
      // Merge data
      let data2 = await response.json();
      data.children = data.children.concat(data2.children);
    }

    // If there was no slash at the end of target, try again with it
    if (!target.endsWith('/')) {
      target = target + '/';
      url = `https://webmention.io/api/mentions.jf2?target=${target}`
      const response = await fetch(url);
      // Merge data
      let data2 = await response.json();
      data.children = data.children.concat(data2.children);
    }

    if (!data || !data.children || data.children.length === 0) {
      return;
    }

    console.log(data.children);

    conversationsDiv.innerHTML = `${conversationsDiv.innerHTML}<h3>Replies</h3>`;

    let mentions = data.children
      .sort(function(a, b) {
        return new Date(a.published) - new Date(b.published);
      });;

    mentions.forEach(mention => {
      let conversationDiv = document.createElement('div');
      conversationDiv.className = 'conversation';
      conversationDiv.innerHTML = `
        <div class="mention">
          <img src="${mention.author.photo}" alt="${mention.author.name}" width="25" height="25" style="max-width: 25px;" />
          <a href="${mention.author.url}">
            <span class="p-name">${mention.author.name}</span>
          </a>                
          <span>${mention.content.html || mention.content.text}</span>                
          <span class="date">
            <a href="${mention['wm-source']}">${new Date(mention.published).toDateString()}</a>
          </span>        
        </div>
        `;
      conversationDiv.id = mention.id;
      conversationsDiv.appendChild(conversationDiv);
    });

  } catch (e) {
    console.log(e);
  }
});