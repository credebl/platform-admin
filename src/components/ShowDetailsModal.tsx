import { Controls, Player } from '@lottiefiles/react-lottie-player';
import { Copy, Ellipsis } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import { copySize, credentialDetailImg, credentialHolderImg, credentialIssuerImg, credentialSignatureImg, playerStyle, stamp, stampImage, verificationTickFill, verifiedTickImage } from '@/config/constant';

import Image from "next/image";
import { RootState } from '@/lib/store';
import { Tooltip } from "react-tooltip";
import { showDetails } from '@/utils/common.interfaces'
import tickJson from '@/lottie/tick.json';
import { useSelector } from 'react-redux';
import { useTranslations } from 'next-intl';
import { Card } from './ui/card';
import { Button } from './ui/button';

export default function ShowDetailsModal({ showModal, setShowModal, content, issuerHolderDetails, animation }: showDetails): React.JSX.Element {

  const { issuer, holder } = issuerHolderDetails
  const translate = useTranslations("ProofRequestPopup");
  const blockData = [
    { title: translate('credential_issuer'), value: content["Issuer"], icon: (<svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-building2-icon lucide-building-2"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>) },
    { title: translate('credential_holder'), value: content["Holder"], icon: (<svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-user-lock-icon lucide-user-lock"><circle cx="10" cy="7" r="4"/><path d="M10.3 15H7a4 4 0 0 0-4 4v2"/><path d="M15 15.5V14a2 2 0 0 1 4 0v1.5"/><rect width="8" height="5" x="13" y="16" rx=".899"/></svg>) },
  ]
  const [activeCopy, setActiveCopy] = useState(10)
  const playerRefs = useRef<(Player | null)[]>([]);

  const handleCopy = async (data: string, index: number) => {
    await navigator.clipboard.writeText(data);
    setActiveCopy(index)
  }

  useEffect(() => {
    async function time(duration: number): Promise<void> {
      return new Promise<void>((resolve, reject) => {
        setTimeout(() => {
          resolve();
        }, duration);
      });
    }
    async function execute() {
      for (let i = 0; i < 4; i++) {

        const player = playerRefs.current[i];
        if (player) {
          player.stop()
          player.play();
          await time(400);
        }
      }
      let verifiedImg = document.querySelector(`[data-role="animated-tick4"]`)
      if (verifiedImg instanceof HTMLElement) {
        await time(300)
        verifiedImg.style.display = 'block'
      }
    }
    if (showModal) setTimeout(() => execute(), 100)

  }, [showModal])

  if (!showModal) return <></>;
  return (
    <>
      <div className="fixed inset-0 bg-background/80 z-[60] ">
      </div>
      <div className="fixed  inset-0 z-[70] flex justify-center items-center">
        <Card className='w-[90%] sm:w-[80%] lg:w-[60%] xl:w-[50%] max-h-[80%] bg-card p-10 rounded-sm relative flex flex-col gap-2 pt-7'>
          <div className='overflow-y-auto'>
            <div>
              <div className='flex justify-center items-center'>
                <h2 className='text-2xl font-bold '
                >{translate('verification_details')}</h2>
              </div>
              <Button
                onClick={() => { setShowModal(false); setActiveCopy(10) }}
                variant={'ghost'}
                className="absolute top-2.5 right-2.5 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
              >
                <svg
                  aria-hidden="true"
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                <span className="sr-only">{translate("close_modal")}</span>
              </Button>
            </div>
            <div className="text-gray-600 p-4 rounded-md border" style={{ fontFamily: 'Ubuntu' }}>
              {content && Object.keys(content).length === 0 ? <div className='text-md h-28 grid place-items-center'>No Details Found !</div> :
                <>
                  <div className='overflow-y-auto'>
                    <div className='flex flex-col justify-between gap-4'>

                      {blockData.map((data, index) => (
                        <div key={index} className='border  flex p-2 rounded-md inset-shadow-2xs shadow-sm items-center' style={{
                          borderColor: index === 3 ? '#1efe1e87' : '',
                          background: index === 3 ? 'linear-gradient(120deg,#d6ffd6 ,white)' : '',
                          height: index === 2 ? 'auto' : '6rem',
                        }}>
                          <div className='relative w-20 h-20 bg-sidebar-accent rounded-lg mr-2 flex items-center justify-center'>
                            {typeof data.icon === 'string' ? (
                              <Image
                                src={data.icon}
                                alt="user icon"
                                layout='fill'
                                className='object-contain'
                              />
                            ) : (
                              data.icon
                            )}
                          </div>

                          <div style={{ width: 'calc(100% - 6rem)' }} className='flex flex-col justify-between'>
                            <div className='flex gap-2 justify-between'>
                              <div className='font-semibold text-sm xl:text-base' >{data.title}</div>
                              {index !== 3 && animation ?
                                <div className='relative ' >
                                  <Player
                                    id={`player${index}`}
                                    ref={(el) => {
                                      playerRefs.current[index] = el;
                                    }}
                                    autoplay={false}
                                    loop={false}
                                    keepLastFrame={true}
                                    src={tickJson}
                                    style={playerStyle}
                                  />
                                </div>
                                :
                                <Image
                                  src={verificationTickFill}
                                  alt="img"
                                  width={verifiedTickImage.width}
                                  height={verifiedTickImage.height}
                                  className="object-contain"
                                />
                              }

                            </div>
                            {/* the actual value of the title */}
                            < div
                              data-tooltip-id={`tooltip-issuer${index}`}
                              className='text-sm xl:text-base max-w-[calc(100%-5rem)] whitespace-nowrap overflow-hidden text-ellipsis' style={{ marginBottom: '5px' }}>{index === 0 ? issuer : index === 1 ? holder : null}</div>
                            <Tooltip
                              id={`tooltip-issuer${index}`}
                              place="top"
                              positionStrategy="fixed"
                              content={index === 0 ? issuer : index === 1 ? holder : ''}
                              style={{ zIndex: 1000 }}
                            />
                            <div className='flex text-base items-center' >
                              <div className='border flex-grow w-full  text-sm xl:text-base bg-background text-muted-foreground opacity-70 rounded-md' style={
                                {
                                  overflow: 'hidden',
                                  textOverflow: 'Ellipsis',
                                  whiteSpace: 'nowrap',
                                }
                              } >
                                {data.value}
                              </div>
                              <div>
                                <Tooltip
                                  id={`tooltip-${data.title}`}
                                  place="top"
                                  positionStrategy="fixed"
                                  content={data.value}
                                  style={{ zIndex: 1000 }}
                                />
                                {index !== 2 &&
                                  <Copy
                                    onClick={() => handleCopy(data.value, index)}
                                    data-tooltip-id={`tooltip-${data.title}`}
                                    size={copySize}
                                    className={`ml-1 ${activeCopy === index ? 'text-green-600' : 'text-gray-500'} hover:text-gray-700  rounded-sm transition-all duration-300`} />}</div>
                            </div>
                          </div>
                        </div>
                      ))}


                      {/*Credential Signature block*/}
                      <div className='border  flex p-2 rounded-md inset-shadow-2xs shadow-sm  h-auto items-center justify-center' >
                        <div className='relative w-20 h-20 bg-sidebar-accent rounded-lg mr-2 flex items-center justify-center'>
                          <div className='object-contain'>
                          <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-user-pen-icon lucide-user-pen"><path d="M11.5 15H7a4 4 0 0 0-4 4v2"/><path d="M21.378 16.626a1 1 0 0 0-3.004-3.004l-4.01 4.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z"/><circle cx="10" cy="7" r="4"/></svg>
                          </div>
                        </div>
                        <div style={{ width: 'calc(100% - 6rem)' }} className='flex flex-col gap-1 justify-between'>
                          <div className='flex gap-2 justify-between'>
                            <div className='font-semibold text-sm xl:text-base' >{translate('credential_signature')}</div>
                            {animation ?
                              <div className='relative'>
                                <Player
                                  id='player2'
                                  ref={(el) => {
                                    playerRefs.current[2] = el;
                                  }}
                                  autoplay={false}
                                  loop={false}
                                  keepLastFrame={true}
                                  src={tickJson}
                                  style={playerStyle}
                                />
                              </div>
                              :
                              <Image
                                src={verificationTickFill}
                                alt="img"
                                width={verifiedTickImage.width}
                                height={verifiedTickImage.height}
                                className="object-contain"
                              />
                            }
                          </div>
                          {/* the actual value of the title */}
                          <div className='flex text-base items-center' >
                            <div className='border text-warp break-all flex-grow w-full bg-background text-muted-foreground opacity-70  text-sm xl:text-base rounded-md'  >
                              {content["Credential Signature"]}
                            </div>
                            <div>
                              <Tooltip
                                id={`tooltip-CredentialSignature`}
                                place="top"
                                positionStrategy="fixed"
                                content={content["Credential Signature"]}
                                style={{ zIndex: 1000 }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/*rest of the details*/}
                      <div className='border  flex p-2 rounded-md inset-shadow-2xs shadow-sm  h-auto' >
                        <div className='relative w-20 h-20 bg-sidebar-accent rounded-lg mr-2 flex items-center justify-center'>
                          {/* <Image
                            src={credentialDetailImg}
                            alt="user icon"
                            layout='fill'
                            className='object-contain'
                          /> */}
                          <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-file-text-icon lucide-file-text"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>
                        </div>
                        <div style={{ width: 'calc(100% - 6rem)' }} className='flex gap-1 '>
                          <div className='flex flex-col justify-between'>
                            <span className='font-bold block text-sm xl:text-base' >{translate('issued_on')} :</span>
                            <span className='font-bold block text-sm xl:text-base' >{translate('verified_on')} :</span>
                            <span className='font-bold block text-sm xl:text-base' >{translate('expiry')} :</span>
                          </div>
                          <div className='flex flex-col justify-between'>
                            <span className='block opacity-70 text-sm xl:text-base' > {content['Issued On']}</span>
                            <span className='block opacity-70 text-sm xl:text-base' > {content['Verified On']}</span>
                            <span className='block opacity-70 text-sm xl:text-base' >{translate('not_expired')} </span>
                          </div>
                        </div>
                        <div className='mr-2'>
                          {animation ?
                            <div className='relative'>
                              <Player
                                id='player3'
                                ref={(el) => {
                                  playerRefs.current[3] = el;
                                }}
                                autoplay={false}
                                loop={false}
                                keepLastFrame={true}
                                src={tickJson}
                                style={playerStyle}
                              />
                            </div>
                            :
                            <Image
                              src={verificationTickFill}
                              alt="img"
                              width={verifiedTickImage.width}
                              height={verifiedTickImage.height}
                              className="object-contain"
                            />
                          }
                        </div>
                      </div>
                      <div className='relative'>
                        <div className={`absolute bottom-[0%] right-[5%] ${animation ? 'hidden' : ''}`} data-role={`animated-tick4`}>
                          {Object.keys(content).length > 0 &&
                            <Image
                              src={stampImage}
                              alt="Centered Image"
                              width={stamp.width}
                              height={stamp.height}
                              className={`w-[100px] h-[100px] opacity-70 ${animation ? 'animate-stampIn' : ''}`}
                            />
                          }
                        </div>
                      </div>

                    </div>
                    <div>
                    </div>
                  </div>
                </>
              }

            </div>
          </div>
        </Card>
      </div >
    </>
  )
}

