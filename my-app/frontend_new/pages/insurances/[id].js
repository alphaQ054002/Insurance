import Web3Modal from "web3modal"
import Head from "next/head";
import { useRouter } from 'next/router';
import styles from "../../styles/Home.module.css";
import {useState, useEffect, useRef} from "react";
import {BigNumber, Contract, ethers} from "ethers";
import { factoryAddr, factoryAbi, implementationAbi } from "../../constantsFactory";

const Post = () => {
  const router = useRouter()
  const { id } = router.query

  const [signer, setSigner] = useState(null);
  const [web3provider, setWeb3provider] = useState(null);

  const [proxyAddr, setProxyAddr] = useState("");
  const implementationnAddr = id;
  console.log("your mom implements", implementationnAddr)

  const [walletConnected, setWalletConnected] = useState(false);
    const web3ModalRef = useRef();

    useEffect(() => {
        if (!walletConnected) {
          web3ModalRef.current = new Web3Modal({
            network: "hardhat",
            providerOptions: {},
            disableInjectedProvider: false,
          });
    
          connectWallet().then(async () => {
            console.log("useeffect reached")
            setSigner(await getProviderOrSigner(true));
            getTimes();
            updateBlockTimestamp();//need to see if this is necessary
            getUserTrancheBalance();
            getProxyAddr();
          });
        }
      }, [walletConnected]);

    const getProxyAddr = async () =>{
        const signer = await getProviderOrSigner(true);
        const factoryContract = new Contract(factoryAddr, factoryAbi, signer);
        const _proxyAddr = await factoryContract.riskSpectrumContracts(implementationnAddr);

        setProxyAddr(_proxyAddr);
    }
    const connectWallet = async () => {
    try {
        await getProviderOrSigner();
        setWalletConnected(true);
    } catch (error) {
        console.error(error);
    }
    };

    const getProviderOrSigner = async (needSigner = false) => {
        const provider = await web3ModalRef.current.connect();
        const web3Provider = new ethers.providers.Web3Provider(provider);
        setWeb3provider(web3Provider);
    
        const { chainId } = await web3Provider.getNetwork();
        if (chainId !== 1 ) {
          console.log(chainId)
          // window.alert("Please switch to the Hardhat fork network!");
          throw new Error("Please switch to the Hardhat fork network");
        }
    
        if (needSigner) {
          const signer = web3Provider.getSigner();
          return signer;
        }
        return web3Provider;
      };
      let AfromAAVE = 0;
      let AfromCompound = 0;
      let BfromAAVE = 0;
      let BfromCompound = 0;
      let amountOfDAI = 0;
      let amountOfDAI_dash = 0;
      const zero = BigNumber.from("0")
      const [blockTimeStamp, setBlockTimeStamp] = useState(0)
      const [S, setS] = useState(zero);
      const [tOne, setTOne] = useState(zero);
      const [tTwo, setTTwo] = useState(zero);
      const [tThree, setTThree] = useState(zero);
      const [isInvested, setIsInvested] = useState(false);//wouldnt exactly be needed
      const [inLiquidMode, setInLiquidMode] = useState(false);
      const [userABalance, setUserABalance] = useState(zero);
      const [userBBalance, setUserBBalance] = useState(zero);
      const [cBalance, setCBalance] = useState(zero);
    
      
    
      const Loading = () => {
        return (
          <div className={styles.loading}>
            <h1>{S}</h1>
            <h1>{tOne}</h1>
            <h1>{tTwo}</h1>
          </div>
        )
      }
    
      const getTimes = async () =>{
        //to be run only once 
        const signer = await getProviderOrSigner(true);
        const contract = new ethers.Contract(proxyAddr, implementationAbi, signer);
        console.log(contract)
        // const contract = new ethers.Contract("SplitInsuranceV2", proxyAddr, signer);
        console.log("Contract is", contract)
        let s = (await contract.S())
        console.log("S is ", s)
        setS(s)
        setTOne((await contract.T1()));
        setTTwo((await contract.T2()));
        setTThree((await contract.T3()));
      }
      
      const mintForDAI_dash = async(value) => {
        console.log("entered")
        const signer = await getProviderOrSigner(true);
        const contract = new Contract(proxyAddr, implementationAbi, signer);
        const valueBN = utils.parseUnits(value, 18);
        const dai = new Contract("0x6b175474e89094c44da98b954eedeac495271d0f", daiAbi, signer);
        console.log("assist contract is ",await contract.AssistContract())
        const tx2 = await dai.approve(await contract.AssistContract(), valueBN);
        const tx = await contract.splitRiskInvestmentPeriod(valueBN, {
          gasLimit: 1000000,
        });
        await tx.wait()
    
      }
    
      const mintForDAI = async (value) => {
        const signer = await getProviderOrSigner(true)
        const contract = new ethers.Contract(proxyAddr, implementationAbi, signer);
        const valueBN = utils.parseUnits(value, 18);
        const dai = new Contract("0x6b175474e89094c44da98b954eedeac495271d0f", daiAbi, signer);
        const tx3 = await dai.approve(await contract.AssistContract(), valueBN);
        await tx3.wait();
        console.log("first approve")
        //idhar tak theek hai 
        const assist = new Contract(await contract.AssistContract(), assistAbi, signer);
        console.log("value of c in assists contract is",await assist.c())
        const tx = await contract.splitRisk(valueBN, {
          gasLimit: 30000000,
        });
        console.log("idk")
        await tx.wait();
        console.log(contract)
        const implementation = new Contract(implementationAddr, implementationAbi, signer)
        console.log("value of c in actual", await implementation.c())
        console.log("value of c in assists contract is",await assist.c())
        await updateCBalance();
    }
    
      const updateBlockTimestamp = async () =>{
        // const provider = new ethers.providers.InfuraProvider("https://eth-mainnet.g.alchemy.com/v2/1jL4KovovKlEyn-QtmIhBAFbarVNUd_M");
    
        const provider = await web3ModalRef.current.connect();
        const web3Provider = new ethers.providers.Web3Provider(provider);
        web3Provider.getBlock('latest').then((block)=>{
            const t = (block.timestamp)
            setBlockTimeStamp(t)
        })
        const signer = await getProviderOrSigner(true);
        const contract = new ethers.Contract(proxyAddr, implementationAbi, signer);
        const isInvested = (await contract.isInvested())
        const inLiquidMode = (await contract.inLiquidMode())
        setIsInvested(isInvested)
        setInLiquidMode(inLiquidMode)
        }
    
    
    
      const getUserTrancheBalance = async () =>{
        const signer = await getProviderOrSigner(true);
        const addrUser = (await signer.getAddress())
        const contract = new Contract(proxyAddr, implementationAbi, signer);
        const AtrancheAddr = (await contract.A());
        const BtrancheAddr = (await contract.B());
        const AtrancheContract = new Contract(AtrancheAddr, TrancheAbi, signer);
        const AtrancheBalance = await AtrancheContract.balanceOf(addrUser);
        setUserABalance(AtrancheBalance);
        const BtrancheContract = new Contract(BtrancheAddr, TrancheAbi, signer);
        const BtrancheBalance = await BtrancheContract.balanceOf(addrUser);
        setUserBBalance(BtrancheBalance);
      }
    
      useEffect(()=>{
        updateBlockTimestamp();
        updateCBalance();
      }, [isInvested, inLiquidMode])
    
      const updateCBalance = async () =>{
        const signer = await getProviderOrSigner();
        const contract = new Contract(proxyAddr, implementationAbi, signer);
        const cBalance = (await contract.cBalance());
        setCBalance(cBalance);
      }
    
      const claimInLiquidmode = async () =>{
        console.log("claim in liquid mode entered")
        const signer = await getProviderOrSigner();
        const contract = new Contract(proxyAddr, implementationAbi, signer);
        const tx = await contract.claimAll({
          gasLimit: 1000000,
        })
        await tx.wait(); 
      }
    
      const claimInFallbackMode = async (AfromAAVE, AfromCompound, BfromAAVE, BfromCompound) =>{
        const contract = new Contract(proxyAddr, implementationAbi, signer);
        const AfromAAVEBN = utils.parseUnits(AfromAAVE.toString(), 18);
        const BfromAAVEBN = utils.parseUnits(BfromAAVE.toString(), 18);
        const AfromCompoundBN = utils.parseUnits(AfromCompound.toString(), 18);
        const BfromCompoundBN = utils.parseUnits(BfromCompound.toString(), 18);
        let tx = await contract.claimA(AfromAAVEBN, AfromCompoundBN);
        await tx.wait();
        await contract.claimB(BfromAAVEBN, BfromCompoundBN);
        await tx.wait();
      }
    
      const claimInOnlyA = async (AfromAAVE, AfromCompound) =>{
        const contract = new Contract(proxyAddr, implementationAbi, signer);
        const AfromAAVEBN = utils.parseUnits(AfromAAVE.toString(), 18);
        const AfromCompoundBN = utils.parseUnits(AfromCompound.toString(), 18);
        let tx = await contract.claimA(AfromAAVEBN, AfromCompoundBN, {
          gasLimit: 1000000,
        });
        await tx.wait();
      }
    
      const Balances = () =>{
        return (
          <div className={styles.balances}>
            <h3>Tranche A Balance: {utils.formatUnits(userABalance.toString(), 18)}</h3>
            <h3>Tranche B Balance: {utils.formatUnits(userBBalance.toString(), 18)}</h3>
          </div>
        )
      }
    
      //so by doing a function call the state is changing then handle that, and render differently, if it rendered so, but dont handle the change that occurs when the user lets the site open for too long
      const SScreen = ()=>{
        return (<div className={styles.topFirst}>
          <div className={styles.center}>
            <h2>Vary your risk exposure using RiskSpectrum</h2>
          </div>
          
          <br/>
          <h4>RiskSpectrum is a decentralized DeFi risk derivative protocol on the Mumbai network.</h4>
          <h4>This page is to provide 2 tranche tokens to those that deposit their DAI for their investments in aDAI and cDAI</h4>  
          <br/>
          <Balances/>
          <br/>
    
          <div>
            <div className = {styles.centerCol}>
              <div className={styles.center}>
              <h4>To vary your risk exposure for your DAI investments in AAVE and Compound</h4>
              </div>
              <div className={styles.center}>
                <h5>Deposit your DAI into the RiskSpectrum protocol</h5><br/>
              </div>
              <div className={styles.center}>
                <p className={styles.contentFirst}>A protocol in which a particular token is pooled in, which are used to buy 
              the return accruing interest in 2 different protocols. In exchange of pooling the tokens, there are 50% SafeBet 
              tranche tokens and 50% BearerOfAll tranche tokens that get issued to the end user that pooled the tokens, the 
              SafeBet tranche tokens have lower risk and has a really less chance of default and the BearerOfAll tranche is 
              the opposite. The risk mitigation happens through trading of SafeBet tranche and BearerOfAll tranche tokens and 
              not by the protocol giving you the tranche tokens.</p>
              </div>
              <div className={styles.center}>
                <input placeholder = "Enter DAI Amount" className = {styles.input} type="number" onChange = {(e)=>{
                  amountOfDAI = (e.target.value)
                }}/>
              </div>
                <br/>
              <div className={styles.center}>
                <button className={styles.mybutton} onClick={()=>{
                  mintForDAI(amountOfDAI);//redirect to success page
                  }}>Deposit</button>
              </div>
                
              </div>
            </div>
        </div>)
      }
    
      const TOne = ()=>{
        return (<div>
          <div className={styles.centerCol}>
            <h2>The investment is currently ongoing for the pooled in DAI tokens, into the protocols,<br/><div className = {styles.center}><h2>AAVE and Compound</h2></div></h2><br/>
          <h4><br/> The investment period is ongoing, you will be able to withdraw your tranche tokens after this observation period.</h4>
          <h4>Tranche tokens are the tokens that represent your share of the pooled DAI tokens</h4>
          </div>
          
          <br/>
          <Balances/>
          <div>
            <div className = {styles.center}>
            {/* to add something related to the progress of the wrapped tokens or so */}
            <h3>Observing the Investments</h3>
            <div className = {styles.investments}></div>
          </div>
          <br/>
          <br/>
          <div>
            <div className={styles.center}>
              <h3>You can invest in middle of the investments as well!</h3>
            </div>
            <div className = {styles.mintWindow}>
            <div className={styles.center}>
              <h4>To vary your risk exposure for your DAI investments in AAVE and Compound</h4>
              </div>
              <div className={styles.center}>
                <h5>Deposit your DAI into the RiskSpectrum protocol</h5><br/>
              </div>
              <div className={styles.center}>
                <p className={styles.contentFirst}>
                A protocol in which a particular token is pooled in, which are used to buy 
              the return accruing interest in 2 different protocols. In exchange of pooling the tokens, there are 50% SafeBet 
              tranche tokens and 50% BearerOfAll tranche tokens that get issued to the end user that pooled the tokens, the 
              SafeBet tranche tokens have lower risk and has a really less chance of default and the BearerOfAll tranche is 
              the opposite. The risk mitigation happens through trading of SafeBet tranche and BearerOfAll tranche tokens and 
              not by the protocol giving you the tranche tokens.
                </p>
                <p className={styles.contentFirst}>
                  The investments are currently active, if you want to invest in the middle of the investments, you can do so.
                  The tranche tokens will be issued to you at a weighted average of the interest bearing tokens. 
    
                </p>
              </div>
            <div className={styles.center}>
                <input placeholder = "Enter DAI Amount" className = {styles.input} type="number" onChange = {(e)=>{
                  amountOfDAI_dash = (e.target.value)
                }}/>
              </div>
                <br/>
              <div className={styles.center}>
                <button className={styles.mybutton} onClick={()=>{
                  console.log("Clicked")
                  mintForDAI_dash(amountOfDAI_dash);//redirect to success page
                  }}>Deposit</button>
              </div>
            </div>
            
          </div>
          </div>
          
          <div></div>
        </div>)
      }
    
      const TTwo = ()=>{
        return (<div>
          <h2>The divest call is to made today, the liquidation of aDAI and cDAI into the DAI are to be made today.</h2>
          <h2>The payouts and the option to claim your DAI tokens will be available from tomorrow. :)</h2>
          </div>)
        }
    
      const TThree = ()=>{
        /////for now we will only observer this
        if(inLiquidMode){
          return(<div>
            <h2>The divest call has been made, the conversion of SafeBet and BearerOfAll tranches are both available.</h2>
            <h2>Claim your tranche tokens and convert them into DAI</h2>
            <div>
              <div className={styles.threeDiv}>
              <h3>You have {userABalance.toString()} SafeBet tranche tokens</h3>
              <h3>You have {userBBalance.toString()} BearerOfAll tranche tokens</h3>
            </div>
            <div className={styles.three}>
              <h3>Claim the DAI tokens that you are entitled to!</h3>  
              <div className={styles.center}>
                <button className = {styles.mybutton} onClick={()=>(claimInLiquidmode())}>Claim!</button>
              </div>
              
            </div>
            </div>
            
          </div>)
        }else{
          return(<div className={styles.contentOnlyA}>
            <h3>The divest call was attempted, but unfortunately the protocols(s) were not in liquid mode</h3>
            <h3>You can claim your higher priority SafeBet tranche tokens now!</h3>
            <div className={styles.descriptionOnlyA}><br/>
              <h4>
                Fallback-claim the DAI tokens that you are entitled to for your SafeBet tranches!<br/>
              You now have to decide which of your traches go to redeem which protocol
              You have an option between aDAI and cDAI
              </h4><br/>
              
            </div>
            {/* to fix this later on, specifically the huge left inclination*/}
            <div >
              <br/>
              <div className={styles.center}>
              <h3>You have {userABalance.toString()} A tranche tokens</h3>      
              </div>
    
              <br/>
    
              <div className={styles.threeDiv}>
                <br/>
                <div className = {styles.claimWindow}>
                  <div className= {styles.claimContent}>
                    <h5>How many of your superior tranches do you wanna exchange for aDAI?</h5>
                  <div className={styles.center}>
                    <input placeholder="Amount from AAVE" onChange = {(e)=>{
                    AfromAAVE = (e.target.value)
                  }}></input>
                  </div>
                  </div>
                </div>
                <div className={styles.claimWindow}>
                  <div className={styles.claimContent}>
                    <h5>How many of your superior tranches do you wanna exchange for cDAI?</h5>  
                  <div className = {styles.center}>
                    <input placeholder="Amount from Compound" onChange = {(e)=>{
                      AfromCompound = e.target.value
                  }}></input>
                  </div>
                  </div>
                  
                  
                </div>
              </div>
              <div className = {styles.center} styles = {{
                display: "flex",
                justifyContent: "space-around",
                left: "50%",
              }}>
                <br/>
                <br/>
                <br/>
                <div className = {styles.button}>
                  <button className={styles.mybutton} onClick = {()=>{
                      claimInOnlyA(AfromAAVE, AfromCompound);
                    }}>Claim!</button>
                </div>
              </div>
            </div>
          </div>)
        }
      }
    
      const AboveTThree = ()=>{
        return(<div className = {styles.container}>
          <div>
          <h2 className={styles.toptxt}>Fallback-claim your tokens</h2>
          <h3 className={styles.scndtxt}>
                Due to illiquidity of the invested tokens, the state of the insurance is not in the Liquid mode.<br></br>
                We are offering redemptions for both the SafeBet and the BearerOfAll tranches</h3>
          <div className={styles.content}>
            <div className={styles.left}>
              <h2> Claim your SafeBet tranche tokens</h2>
    
              <div className={styles.leftdiv}>
              <h3>You have {userABalance.toString()} SafeBet tranche tokens</h3>
              <div>
                How much of your SafeBet tranche tokens do you want to redeem from AAVE?
                <br/>
                <input label="AfromAAVE" placeholder="Amount from AAVE"></input>
              </div>
              <div>
              How much of your SafeBet tranche tokens do you want to redeem from Compound?
              <br/>
              <input label = "AfromCompound" placeholder="Amount from Compound"></input>
              </div>
              </div>
            </div>
            <div className={styles.right}>
              <h2>Claim your BearerOfAll tranche tokens</h2>
    
              <div className={styles.leftdiv}>
              <h3>You have {userABalance.toString()} BearerOfAll tranche tokens</h3>
              <div>
                How much of your BearerOfAll tranche tokens do you want to redeem from AAVE?
                <br></br>
                <input label="BfromAAVE" placeholder="Amount from AAVE" onChange = {(e)=>{BfromAAVE = e.target.value}}></input>
              </div>
              <div>
              How much of your BearerOfAll tranche tokens do you want to redeem from Compound?
              <br/>
              <input placeholder="Amount from Compound" label="BfromCompound" onChange = {(e)=>{
                BfromCompound = e.target.value
              }}></input>
              </div>
              </div>
            </div>
            <div className={styles.btn_claim}>
                <button type = "submit"  onClick = {() => {
                  const tx = claimInFallbackMode(AfromAAVE, AfromCompound, BfromAAVE, BfromCompound);
                }} className={styles.mybutton}>Claim!</button>
              </div>
          </div>
          </div>
        </div>)
      }
      const Screen = () => {
        if (blockTimeStamp < S){
          return(
            <SScreen/>
          )
        }
        //get aDAI and cDAI balance
        else if (blockTimeStamp < tOne){
          return(
            <TOne/>
            // <SScreen/>
          )
        }
        else if (blockTimeStamp < tTwo){
          return(
            <TTwo/>
          )
        }
        else if (blockTimeStamp < tThree){
          return(
            <TThree/>
          )
        }
        else if (blockTimeStamp > tThree){
          if(inLiquidMode){
            return <TThree/>
          }else{
            return(
              // <AboveTThree/>
              <TThree/>
              // <TOne/>
            )
          }
          
      } else{
        return(
          <div>
            {/* <h1>Something went wrong</h1> */}
            {/* <TThree/> */}
            <AboveTThree/>
          </div>
        )
      }
    }
      return (
        <div>
          <Head>
            <title>RiskSpectrum</title>
            <meta
              name="description"
              content="Insurance page for RiskSpectrum"
            />
            <link rel="icon" href="/favicon.ico" />
            {/* change the icon */}
          </Head>
          <main className={styles.main}>
            <div>
              <Screen/>
              {blockTimeStamp} is blocktimestamp
              {S.toString()} is S
              {tOne.toString()} is tone
              {tTwo.toString()} is ttwo
              {tThree.toString()} is t three
              {cBalance.toString()} is C Balance
              <div>
              </div>
            </div>
          </main>
        </div>
      );

}

export default Post