
import {createMessageConnector,createWaitForInputMessage,createWaitForFieldMessage} from "../src"; 


/**
 * compare initData to expectedInitData
 * @param {*} initData 
 * @param {*} expectedInitData 
 */
const assertInitData = (initData, expectedInitData)=>{

  expect(initData.action).toBe(expectedInitData.action);
  expect(initData.dataType).toBe(expectedInitData.dataType);
  expect(initData.form.id).toBe(expectedInitData.form.id);
  expect(initData.form.title).toBe(expectedInitData.form.title);
  expect(initData.form.label).toBe(expectedInitData.form.label);

  initData.form.fields.forEach((field,index)=>{
      expect(expectedInitData.form.fields[index].label).toEqual(field.label);     
      expect(expectedInitData.form.fields[index].id).toEqual(field.id);
      expect(expectedInitData.form.fields[index].value).toEqual(field.value);     
      expect(expectedInitData.form.fields[index].nLines).toBe(field.nLines);     
    });

};

describe("Mobile and Device Communication",()=>{

  test('receiver sender should send input message', async () => {

        
    const deviceConfig = {
      //url: 'http://localhost:1337',
      // cSpell:disable
      //apikey: "k7jc3QcMPKEXGW5UC",
      // cSpell:enable     
      initData:{
        action: "input",    
        dataType: "form",        
        form: {
          title: "Login",
          id:"someForm",
          label:"someFolder",
          fields: [{
            label: "Email address",
            value: "some value"
          }, {
            label: "Password",
            type: "secret"
          }, {
            label: "Login",
            type: "action"
          }]
        }
      }
    };
      


    const deviceConnector = createMessageConnector(); //device starts up

    let fieldReceiversOnDevice= createWaitForFieldMessage(deviceConfig.initData.form.fields); //create a message receiver for each field in the form


    const connectionCode=await deviceConnector.connect(deviceConfig); //device is now ready to connect

    
    const mobileConnector = createMessageConnector(); //Mobile App starts up
    const mobileConfig={};
    const mobileInput=createWaitForInputMessage(mobileConfig);

    const {initData} = await mobileConnector.connect(mobileConfig,connectionCode) //Mobile App connects to the device using the connectionCode that is obtained from the QR Code
    assertInitData(initData,deviceConfig.initData); //initData received by the mobile should match the one sent by the device

    const messageSentByMobile = { content: "dilshat" };
    mobileConnector.sendInputMessage(messageSentByMobile, 0); //mobile  sends the first message
    
    const messageReceivedByDevice = await fieldReceiversOnDevice[0].get(); //device receives the message

    expect(messageReceivedByDevice).toEqual(messageSentByMobile); //received message should match what is sent by the mobile

    const message2SentByMobile = { content: "password111" };
    mobileConnector.sendInputMessage(message2SentByMobile, 1); //mobile  sends the second message

    const message2ReceivedByDevice = await fieldReceiversOnDevice[1].get() //device receives the message
    expect(message2ReceivedByDevice).toEqual(message2SentByMobile);
    
    
    const messageSentByDevice={content:"some value"};
    deviceConnector.sendInputMessage(messageSentByDevice,0); //device sends the first message
    const messageReceivedByMobile=await mobileInput.get();   //mobile receives the message 
    expect(messageReceivedByMobile.data.index).toEqual(0);   //index should match
    expect(messageReceivedByMobile.data.value).toEqual(messageSentByDevice); //value should match the message sent by the device

    const message2SentByDevice={content:"some value 2"};
    deviceConnector.sendInputMessage(message2SentByDevice,1); //device sends another message
    const message2ReceivedByMobile=await mobileInput.get();      
    expect(message2ReceivedByMobile.data.index).toEqual(1);
    expect(message2ReceivedByMobile.data.value).toEqual(message2SentByDevice);      
    
    const deviceConfig2 = {
        //url: 'http://localhost:1337',
        // cSpell:disable
        //apikey: "k7jc3QcMPKEXGW5UC",
        // cSpell:enable     
        initData:{
            action: "input",
            dataType: "form",
            form: {
                    id: "test2@globalinput.co.uk",
                    title: "Global Input App Test 2",
                    label: "Global Input Test 2",
                    fields: [{
                            label: "First Name",
                            id: "firstName",
                            value: "",
                            nLines: 10                    
                        },{
                            label: "Last Name",
                            id: "lastName",
                            value: "",
                            nLines: 10                    
                        }]
            }
        }
      };
      fieldReceiversOnDevice= createWaitForFieldMessage(deviceConfig2.initData.form.fields); //create a message receiver for each field in the form
      deviceConnector.sendInitData(deviceConfig2.initData); //device instruct mobile to display a different form
      const mobileInputMessage=await mobileInput.get();   //mobile receives the message
      assertInitData(mobileInputMessage.initData,deviceConfig2.initData); //received should match what is sent
      const message3SentByMobile = { firstName: "dilshat" };
      mobileConnector.sendInputMessage(message3SentByMobile,0);        //mobile sends the message
      const message3ReceivedByDevice = await fieldReceiversOnDevice[0].get();  //device receives it
      expect(message3ReceivedByDevice).toEqual(message3SentByMobile);

      const message4SentByMobile = { lastName: "hewzulla" };
      mobileConnector.sendInputMessage(message4SentByMobile,1); //mobile sends a message
      const message4ReceivedByDevice = await fieldReceiversOnDevice[1].get(); //device receives it.
      expect(message4ReceivedByDevice).toEqual(message4SentByMobile);

      const message3SentByDevice={firstName: "name1"};            
      deviceConnector.sendInputMessage(message3SentByDevice,0); //device sends the first message, and the mobile receives it      
      const message3ReceivedByMobile=await mobileInput.get();  
      expect(message3ReceivedByMobile.data.index).toEqual(0);
      expect(message3ReceivedByMobile.data.value).toEqual(message3SentByDevice);
      mobileConnector.disconnect();
      deviceConnector.disconnect();  
});




  test('receiver sender should pairing', async () => {
    
        const deviceConfig={
        url:'https://globalinput.co.uk',
        // cSpell:disable      
        securityGroup:"KqfMZzevq2jCbQUg+W8i750",        
        apikey:"k7jc3QcMPKEXGW5UC",
        // cSpell:enable              
        initData:{
            action:"input",
            form:{
                   title:"Login",
                      fields:[{
                    label:"Email address",
                    value:"some value"
                    },{
                      label:"Password",
                     type:"secret"
                    },{
                      label:"Login",
                     type:"action"
                   }]
              }
        }
    };
    const codeAES = "YFd9o8glRNIvM0C2yU8p4";
    const deviceConnector=createMessageConnector();
    deviceConnector.setCodeAES(codeAES);          //change the encryption for QR Code
    const fieldReceiversOnDevice=createWaitForFieldMessage(deviceConfig.initData.form.fields);
    const connectCode=await deviceConnector.connect(deviceConfig);  //connect
    const encryptedDevicePairingCodeData=deviceConnector.buildPairingData(); //get pairing code from the device

    const mobileConnector=createMessageConnector(); //mobile app
    const {codeData}=await mobileConnector.connect({},encryptedDevicePairingCodeData); //expected to get the codeData for pairing
    
    expect(codeData).toEqual({
        securityGroup:deviceConfig.securityGroup,
        codeAES,
        action:"pairing"
    });
    mobileConnector.setCodeAES(codeData.codeAES);   //pair the mobile with the data
    mobileConnector.setSecurityGroup(codeData.securityGroup); //pair the mobile with the data
    const inputCodeData=deviceConnector.buildInputCodeData(); //get the connectionCode
    
    const mobileConfig={};
    const mobileInput=createWaitForInputMessage(mobileConfig);
    const {initData}=await mobileConnector.connect(mobileConfig,inputCodeData); //connect to the device using the code
    assertInitData(initData,deviceConfig.initData);  //should get the initData from the device
  
    const messageSendByMobile={content:"dilshat"};    
    mobileConnector.sendInputMessage(messageSendByMobile, 0); //mobile sends the message    
    const messageReceivedByDevice=await fieldReceiversOnDevice[0].get();
    expect(messageReceivedByDevice).toEqual(messageSendByMobile);

    const messageByDevice={content:"next content"};
    deviceConnector.sendInputMessage(messageByDevice,0);    
    const messageReceivedByMobile=await mobileInput.get();
    expect(messageReceivedByMobile.data.index).toEqual(0);
    expect(messageReceivedByMobile.data.value).toEqual(messageByDevice);
  
    mobileConnector.disconnect();
    deviceConnector.disconnect();  
  });


});


