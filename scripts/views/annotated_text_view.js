crayon.views || ( crayon.views = {} )

crayon.views.AnnotatedTextView = ( function () {

  function AnnotatedTextView ( annotation ) {
    this.model = annotation;
    this.rendered = false;
  };

  AnnotatedTextView.prototype.render = function () {
    var elements, containingNode, matchRegex, node, i;
    if ( this.rendered ) return this;

    elements = this.findAnnotationElements();

    for ( i = 0; i < elements.length; i++ ) {
      matchRegex = new RegExp( crayon.helpers.utility.regexEscape(elements[i].matchStr) );
      containingNode = crayon.helpers.utility.find(
        elements[i].element.childNodes,
        function ( node ) {
          return !!node.nodeValue && !!node.nodeValue.match( matchRegex );
        }
      );

      newNode = this._createModifiedNode( containingNode, elements[i].matchStr );
      elements[i].element.replaceChild( newNode, containingNode );
    }

    this.rendered = true;

    return this;
  };

  AnnotatedTextView.prototype.findAnnotationElements = function () {
    var results, sentences, i, j, parentNode, sentResults, rawResults;
    parentNode = this.model.selectedNode ? this.model.selectedNode : document.body;
    results = [];

    // first try by full text
    rawResults = this._getDOMNodesFromText( this.model.attributes.text, parentNode );

    if ( rawResults.snapshotLength < 1 ) {
      // next try by full sentences
      sentences = crayon.helpers.utility.separateSentences( this.model.attributes.text );
      sentResults = [];

      for ( i = 0; i < sentences.length; i++ ) {
        rawResults = this._getDOMNodesFromText( sentences[i] );
        switch ( rawResults.snapshotLength ) {
          case 1:
            results.push({
              element: rawResults.snapshotItem(0),
              matchStr: sentences[i].trim()
            });
            break;
          case 0:
            // check by word
            break;
          default:
            // find all that are adjacent to the rest of the annotated text?
            break;
        }
      }
    } else {

      // TODO: handle multiples -- need more views. Extract to lib?
      for ( j = 0; j < rawResults.snapshotLength; j++ ) {
        results.push(
          {
            element: rawResults.snapshotItem( j ),
            matchStr: this.model.attributes.text
          }
        );
      }

    }

    return results;
  };

  // private

  AnnotatedTextView.prototype._getDOMNodesFromText = function ( text, parentNode ) {
    if ( !parentNode ) parentNode = document.body;

    return(
      document.evaluate(
        '//*[contains(text(), "' + text.trim() + '")]',
        parentNode,
        null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null
      )
    );
  };

  AnnotatedTextView.prototype._createModifiedNode = function ( node, matchStr ) {
    var div = document.createElement('div'),
        frag = document.createDocumentFragment();

    div.innerHTML = node.nodeValue.replace(
      new RegExp( crayon.helpers.utility.regexEscape(matchStr) ),
      '<span class="crayon-annotation-text-view">$&</span>'
    );

    while ( div.firstChild ) {
      frag.appendChild( div.firstChild );
    }

    return frag;
  };

  return AnnotatedTextView;

})();