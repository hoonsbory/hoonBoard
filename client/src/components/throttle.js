export const throttling = () => {
    let throttleCheck;

    return {
         throttle(callback, milliseconds) {
            // if (!throttleCheck) {
            //     throttleCheck = true;
            //     setTimeout(() => {
            //         callback(...arguments);
            //         throttleCheck = false;
            //     }, milliseconds);
            // }
            //내가 짜려던 건. 조건문을 거짓으로 놓고 들어왔을때 트루를 줘서 이벤트를 막은 후에 지정한 초만큼 시간이 지난 후 콜백을 실행하고 변수에 false를 줘서 다시 조건문에 들어오게 하는 방식이다.
            //근데 구글링 해보니 굳이 true를 안주고 변수에 settimeout을 할당해서 하는  방법이 있었다. 차이점은 저렇게 함수를 바인딩하고나니까 throttleCheck는 1을 리턴했다. 특이한건 이벤트가 실행될때마다
            //1씩 증가했던것. 그래서 조건문을 피할 수 있었다. 그치만 왜 1씩 증가하는지는 알 수가 없다. 대충 구글링해본 결과로는 settimeout이나 setinterval은 ID를 갖고 있는데, 
            //이벤트때마다 새로운 setTimeout이 생성되어 ID값이 1씩 증가하여 리턴되는 것 같다. 
            //그렇다면 결과적으로 내가 짠 코드는 throttleCheck에 true를 주는 불필요한 행동이 있기 때문에 아래 코드가 더 효율적이라 할 수 있겠다.
            if (!throttleCheck) {
                throttleCheck = setTimeout(async() => {
                    await callback(...arguments);
                    throttleCheck = false;
                }, milliseconds);
            }
        }
    };
};