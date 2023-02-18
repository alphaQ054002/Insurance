import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import {useRef, useEffect, useState, React} from "react"
import { BigNumber, providers, ethers, Contract, utils} from "ethers";
import Web3Modal from "web3modal";
import {Addr, Abi, TrancheAbi} from "../constants";
import Footer from "../components/Footer";
import { getAddress } from "ethers/lib/utils";
import {insuraTranch} from "./images/insuratranch.png"
import Link from "next/link";


export default function Home (signerInput) {

    const [signer, setSigner] = useState(null);
    const [address, setAddress] = useState("");

    useEffect( () => {
        if (signerInput) {
            setSigner(signerInput.prop1)
            getAddress()
        }
    })

    const getAddress = async () => {
        if(signer){
            const address = await signer.getAddress();
            setAddress(address);
        }
        
    }

    const Compnnt = async () => {
        if(signer){
            const chainId = await signer.getChainId();
        console.log(chainId)
        }
        
    }

    return (
        <div>
      <Head>
        <title>InsuraTranc</title>
        <meta
          name="description"
          content="Insurance page for InsuraTranch"
        />
        <link rel="icon" href="/favicon.ico" />
        {/* change the icon */}
      </Head>
      <main className={styles.main}>

        <div className={styles.intro}>
            <div className={styles.firstDiv}>
                <h4 className={styles.firstTitle}>InsuraTranch</h4>
                <p>Our protocol aims to adjust the risk exposed with any particular couple of investments, in this implementation it is only two.The investments are made on behalf of the users by the protocol by the user-pooled in tokens.The user gets x/2 of each SafeBet and BearerOfAll tranche tokens if the user invests x number of tokens, that will be used for investments.
The main features of the 2 tranches:<br/>
SafeBet is the token that gets higher priority in the payouts during both liquid and non-liquid.
The BearerOfAll on the other hand, takes lower priority and is exposed to all of the risks in all the occasions.</p>
<div className={styles.initContent}>
        <div className={styles.buttonsFirstPg}>
            <button className="btn btn-danger"><Link href="/insure">Get Insured!
            </Link></button>
            {/* the get insured button willl lead to all the available insurances, for now it will take to the insurance  */}
            <button className="btn btn-danger">Create Insurance!</button>
        </div>
            
        </div>
            </div>
            <img className={styles.imageUniswap}src="https://upload.wikimedia.org/wikipedia/commons/5/5a/Uniswap_Logo_and_Wordmark.svg" alt="InsuraTranch logo"></img>
        
            {console.log(Compnnt())}
        </div><br/><br/><br/>
        <div className={styles.Insurances}>
            <h3>Your Insurances</h3>
        </div>
      </main>
    </div>
    )
}