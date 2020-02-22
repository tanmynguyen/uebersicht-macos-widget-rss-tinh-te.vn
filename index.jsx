function xmlToJson(xml) {
  // Create the return object
  var obj = {};

  if (xml.nodeType == 1) {
    // element
    // do attributes
    if (xml.attributes.length > 0) {
      obj["@attributes"] = {};
      for (var j = 0; j < xml.attributes.length; j++) {
        var attribute = xml.attributes.item(j);
        obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
      }
    }
  } else if (xml.nodeType == 3) {
    // text
    obj = xml.nodeValue;
  }

  // do children
  // If all text nodes inside, get concatenated text from them.
  var textNodes = [].slice.call(xml.childNodes).filter(function(node) {
    return node.nodeType === 3;
  });
  if (xml.hasChildNodes() && xml.childNodes.length === textNodes.length) {
    obj = [].slice.call(xml.childNodes).reduce(function(text, node) {
      return text + node.nodeValue;
    }, "");
  } else if (xml.hasChildNodes()) {
    for (var i = 0; i < xml.childNodes.length; i++) {
      var item = xml.childNodes.item(i);
      var nodeName = item.nodeName;
      if (typeof obj[nodeName] == "undefined") {
        obj[nodeName] = xmlToJson(item);
      } else {
        if (typeof obj[nodeName].push == "undefined") {
          var old = obj[nodeName];
          obj[nodeName] = [];
          obj[nodeName].push(old);
        }
        obj[nodeName].push(xmlToJson(item));
      }
    }
  }
  return obj;
}

export const initialState = {
  output: {
    item: []
  }
};

export const command = `/usr/bin/curl -s https://tinhte.vn/rss`;

export const updateState = (event, previousState) => {
  if (event.error) {
    return { ...previousState, warning: `We got an error: ${event.error}` };
  }

  const XmlNode = new DOMParser().parseFromString(event.output, "text/xml");

  const result = xmlToJson(XmlNode);

  return { ...previousState, output: result.rss.channel };
};

export const refreshFrequency = 10 * 60 * 1000; // 10 min

export const render = ({ output }) => {
  const { item, generator } = output;
  return (
    <div className="rss-container">
      <h3>{generator}</h3>
      {item.map(v => (
        <div className="rss-item" key={v.link}>
          <a href={v.link}>
            <span>- {v.title}</span>
          </a>
        </div>
      ))}
    </div>
  );
};

export const className = `
    left: 0px;
    top: 288px;
    font-family: 'Helvetica Neue';
    font-size: 14px;
    background-color: rgba(255,255,255,0.9);
    padding: 10;
    width: 100%;
    max-width: 330px;

    h3 {
      margin-left: 5px;
    }

    .rss-container {
      padding: 10px;
    }

    .rss-item {
      margin-bottom: 5px;
    }

    .rss-item a {
      text-decoration: none;
    }
    .rss-item a span {
      font-size: 12px;
    }
  `;
