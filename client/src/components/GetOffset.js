export default function GetOffset(target,textNode,offset){
    var count = 0;
    var breakFunc = false;
    
    depth(target)
    function depth(targetNode){
        if(!targetNode || breakFunc){
            return
        }
        else if(textNode===targetNode || textNode===targetNode.firstChild){
            count += offset
            breakFunc = true
            return
        } 
        else if(targetNode.nodeName==="#text") {
            count += targetNode.length
            depth(targetNode.nextSibling)
        }
        else{
            depth(targetNode.firstChild)
            depth(targetNode.nextSibling)
        }
         
    }
    return count;
}