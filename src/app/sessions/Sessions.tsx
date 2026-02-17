'use client'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { JSX, useEffect, useState } from 'react'
import { Monitor, RefreshCw, Smartphone, UserCog } from 'lucide-react'

import { AlertComponent } from '@/components/AlertComponent'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import ConfirmationModal from '@/components/confirmation-modal'
import { RootState } from '@/lib/store'
import { confirmationMessages, deleteSession, userSessions } from '@/config/constant'
import { deleteRequest, getRequest, postRequest } from '@/config/apiCalls'
import Loader from '@/components/Loader'
import { DeleteIcon, DestructiveConfirmation } from '@/config/SVG'
import { dateConversion } from '@/lib/dateConversion'
import { useAppSelector } from '@/lib/hooks'
import { Session, clientInfo, SESSION_TYPE } from '@/utils/common.interfaces'
import { HttpStatusCode } from 'axios'

function Sessions(): JSX.Element {
  const [loading, setLoading] = useState(true)
  const [sessions, setSessions] = useState<Session[]>()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [deletionId, setDeletionId] = useState<string | null>(null)

  const [showConfirmation, setShowConfirmation] = useState<boolean>(false)
  const userId = useAppSelector((state: RootState) =>{console.log("state",state);return state.user?.userDetails?.userId})
  console.log("userId",userId)
  const currentSession = useAppSelector(
    (state: RootState) => state.session.sessionId,
  )


  const fetchSessions = async (): Promise<void> => {
      console.log("fetchSessions",userId)
    if (!userId) {
      setLoading(false)
      setError('User id is missing')
      return
    }

    try {
      const url = userSessions.replace('userId:', userId)
      const response = await getRequest(url)
      console.log("response",response)
      if (
        typeof response !== 'string' &&
        response?.data?.statusCode ===  HttpStatusCode.Ok
      ) {
        const sortByDate = response?.data.data
          .sort(
            (a: Session, b: Session) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          )
          .filter((session: Session) => session.id !== currentSession)
        const activeSession = response?.data.data.filter(
          (session: Session) => session.id === currentSession,
        )
        if (activeSession.length > 0) {
          sortByDate.unshift(...activeSession)
        }
        setSessions(sortByDate)
      }
    } catch (error) {
      console.error('Error fetching user sessions:', error)
      setError('Error Fetching Session')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSessions()
    console.log("userId",userId)
  }, [userId])

  const handleDelete = async (): Promise<void> => {
    if (!deletionId) {
      setLoading(false)
      setError('Session id is missing')
      return
    }

    try {
      const url = deleteSession.replace('sessionId:', deletionId)
      const response = await deleteRequest(url)
      if (
        typeof response !== 'string' &&
        response?.data?.statusCode === HttpStatusCode.Ok 
      ) {
        setShowConfirmation(false)
        setSuccess('Session Deleted Successfully')
        fetchSessions()
      }
    } catch (error) {
      console.error('Error deleting session:', error)
      setError('Error Deleting Session')
    } finally {
      setLoading(false)
    }
  }

  function getSessionIcon(
    record: Session,
    clientInfo: clientInfo,
  ): JSX.Element {
    if (record.sessionType === SESSION_TYPE.ORGANIZATION) {
      return (
        <UserCog size={44} strokeWidth={1} className="text-muted-foreground" />
      )
    }

    const deviceIcons: Record<string, JSX.Element> = {
      desktop: (
        <Monitor size={50} strokeWidth={1} className="text-muted-foreground" />
      ),
      mobile: (
        <Smartphone
          size={44}
          strokeWidth={1}
          className="text-muted-foreground"
        />
      ),
    }

    if (record.sessionType === SESSION_TYPE.USER) {
      return deviceIcons[clientInfo.deviceType] ?? deviceIcons['desktop']
    }

    return deviceIcons['desktop']
  }

  if (!loading && (!sessions || sessions.length === 0)) {
    return <div className='mx-6 mt-6'>Session details not found</div>
  }

  if (loading) {
    return (
      <div>
        <Loader />
      </div>
    )
  }

  return (
      <div>
      <div className="px-6 mb-1 flex justify-between">
            <h1 className="text-2xl font-bold text-foreground">User Sessions</h1>
            <Button
              variant="outline"
              onClick={fetchSessions}
              className="rounded-lg mr-4 sm:mr-0 items-center mt-2 sm:mt-0"
            >
              <RefreshCw
                className={`h-5 w-5 ${loading ? "animate-spin" : ""}`}
              />
            </Button>
      </div>
         <p className='px-6 mb-4 text-muted-foreground'>Manage user sessions</p>
    <Card className="border py-2 mx-6">
      <CardContent className="overflow-y-auto py-4">
        {success && (
          <div className="w-full" role="alert">
            <AlertComponent
              message={success}
              type={'success'}
              onAlertClose={() => {
                setSuccess(null)
              }}
            />
          </div>
        )}
        {error && (
          <div className="w-full" role="alert">
            <AlertComponent
              message={error}
              type={'failure'}
              onAlertClose={() => {
                setError(null)
              }}
            />
          </div>
        )}

        <ConfirmationModal
          loading={false}
          success={success}
          failure={error}
          openModal={showConfirmation}
          closeModal={() => setShowConfirmation(false)}
          onSuccess={handleDelete}
          message={'This session will be deleted permanently.'}
          buttonTitles={[
            confirmationMessages.cancelConfirmation,
            confirmationMessages.sureConfirmation,
          ]}
          isProcessing={loading}
          setFailure={setError}
          setSuccess={setSuccess}
          image={<DestructiveConfirmation />}
        />
        {sessions &&
          Array.isArray(sessions) &&
          sessions.map((record) => {
            const clientInfo =
              typeof record.clientInfo === 'string'
                ? JSON.parse(record?.clientInfo)
                : record?.clientInfo
            return (
              <div
                key={record?.id}
                className="mt-2 h-auto rounded-md border p-4 md:flex-row"
              >
                <div className="flex h-full cursor-default flex-wrap items-center justify-between">
                  <div className="flex min-w-[300px] items-center gap-4">
                    <div className="px-2">
                      {clientInfo ? (
                        getSessionIcon(record, clientInfo)
                      ) : (
                        <Monitor
                          size={50}
                          strokeWidth={1}
                          className="text-muted-foreground"
                        />
                      )}
                    </div>
                    <div>
                      {clientInfo?.ip && (
                        <div className="font-mono text-sm font-semibold">
                          IP:{' '}
                          <span className="break-all">
                            {clientInfo?.ip ?? 'Not Available'}
                          </span>
                        </div>
                      )}
                      <div>
                        Created:{' '}
                        <span className="text-muted-foreground">
                          {dateConversion(record.createdAt)}
                        </span>
                      </div>
                      <div>
                        Expires:{' '}
                        <span className="text-muted-foreground">
                          {dateConversion(record.expiresAt)}
                        </span>
                      </div>
                      <div>
                        Type:{' '}
                        <span className="text-muted-foreground">
                          {record.sessionType === SESSION_TYPE.ORGANIZATION
                            ? 'Client Session'
                            : 'User Session'}
                        </span>
                      </div>
                    </div>
                  </div>
                  {clientInfo &&
                    clientInfo?.ip &&
                    record.sessionType !== SESSION_TYPE.ORGANIZATION && (
                      <div
                        className={
                          'grid h-auto w-[250px] items-center justify-start overflow-hidden rounded-md p-4 pl-20 text-sm transition-all duration-500 lg:pl-4'
                        }
                      >
                        <div className="flex justify-start">
                          <dt>Browser :&nbsp;</dt>
                          <dd className="text-muted-foreground">
                            {clientInfo?.browser}
                          </dd>
                        </div>
                        <div className="flex justify-start">
                          <dt>OS :&nbsp;</dt>
                          <dd className="text-muted-foreground">
                            {clientInfo?.os}
                          </dd>
                        </div>
                        <div className="flex justify-start">
                          <dt>Device :&nbsp;</dt>
                          <dd className="text-muted-foreground">
                            {clientInfo?.deviceType}
                          </dd>
                        </div>
                      </div>
                    )}
                  <div
                    className={
                      'flex h-[50px] grow items-center justify-end md:w-[130px] lg:grow-0'
                    }
                  >
                    {record?.id === currentSession ? (
                      <Badge className="success-alert rounded-full p-1 px-3">
                        Current Session
                      </Badge>
                    ) : (
                      <div>
                        <Button
                          data-testid="deleteBtn"
                          type="button"
                          color="danger"
                          onClick={() => {
                            setError(null)
                            setSuccess(null)
                            setShowConfirmation(true)
                            setDeletionId(record.id)
                          }}
                          className="flex justify-end bg-transparent p-0 px-3 shadow-none hover:bg-transparent focus:ring-0"
                        >
                          <DeleteIcon />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
      </CardContent>
    </Card>
    </div>
  )
}

export default Sessions
