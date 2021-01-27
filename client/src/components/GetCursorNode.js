export default function GetCursorNode(target,idx){
    var count = 0;
    var result = ''
    
    depth(target)
    return [result,count-idx]

    function depth(targetNode){
        if(!targetNode || count>=idx) return
        if(targetNode.nodeName==="#text") {
            count += targetNode.length
            if(count>=idx) result = targetNode
            else depth(targetNode.nextSibling)
        }
        else{
            depth(targetNode.firstChild)
            depth(targetNode.nextSibling)
        }
         
    }
}