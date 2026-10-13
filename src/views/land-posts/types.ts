export interface Member {
  _id: string
  name?: string
  username?: string
  email?: string
  mobile?: string
}

export interface ReviewReply {
  content: string
  reviewerName?: string
  createdAt: string
}

export interface VerificationState {
  landNumberVerified: boolean
  authorizationLetterVerified: boolean
}

export interface ContentChange {
  field: string
  before: unknown
  after: unknown
}

export interface ReviewLog {
  action: 'approved' | 'rejected' | 'verification_updated' | 'content_edited'
  operator: { userId: string; username: string }
  before?: VerificationState
  after?: VerificationState
  changes?: ContentChange[]
  createdAt: string
}

export interface LandPost {
  _id: string
  type: string
  landType?: string[]
  contactName: string
  city: string
  district: string
  section?: string
  landNumbers?: string[]
  approximateLocation?: string
  landArea?: number
  landAreaUnit?: string
  landShareNumerator?: number
  landShareDenominator?: number
  landOwnerCount?: number
  floorAreaRatio?: number
  buildingCoverageRatio?: number
  frontageWidth?: number | string
  lotDepth?: number
  roadCondition?: string
  landCondition?: string
  description: string
  priceBudget?: string
  unitPrice?: number
  hasAuthorizationLetter?: boolean
  directOwnerContact?: boolean
  visibility: string
  images?: { key: string; url: string }[]
  contactPhone?: string
  contactLine?: string
  status: string
  reviewNote?: string
  reviewReplies?: ReviewReply[]
  landNumberVerified?: boolean
  authorizationLetterVerified?: boolean
  reviewLogs?: ReviewLog[]
  version?: number
  env?: string
  userId?: Member | string | null
  createdAt: string
  updatedAt: string
  lastEditedAt?: string
}
