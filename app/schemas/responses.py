from pydantic import BaseModel, Field


class GetTicketsResponse(BaseModel):
    ticket_id: str = Field(..., description="Ticket ID")
    owner: str = Field(..., description="Ticket owner")
    status: str = Field(..., description="Ticket status")
    reason: str = Field(..., description="Ticket reason")
    approver: str = Field(..., description="Ticket approver")
    created_at: str = Field(..., description="Creation datetime in ISO-8601 format")
