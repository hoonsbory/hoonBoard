import React, { useState, useCallback, useMemo} from 'react'


const UseCallbackExample = () => {
    const [string, setString] = useState('');
    const [stringList, setStringList] = useState([]);
  
    const change = useCallback((e) => {
      setString(e.target.value);
    }, []);
  
    const insert = useCallback(() => {
      const newList = stringList.slice();
      newList.push(string);
      setStringList(newList);
    }, [string, stringList]);
  
    const sum = useCallback((list) => {
      console.log('문자들을 합치는 중입니다...');
      let stringSum = '';
      for(let value of list) {
        stringSum += value + ' ';
      }
      return stringSum;
    }, []);
  
    const result = useMemo(() => sum(stringList), [stringList, sum]);
  
    return (
      <div>
        <input type='text' onChange={change}/>
        <button onClick={insert}>문자열 추가</button>
        {result}
      </div>
    )
  }

  export default UseCallbackExample;