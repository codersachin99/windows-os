"""Contacts Controller handling all contact REST operations."""

from typing import Any, Dict, Tuple
try:
    from controllers.base_controller import BaseController
    from models.contact import ContactModel
except ImportError:
    from .base_controller import BaseController
    from ..models.contact import ContactModel


class ContactController(BaseController):
    """Dispatches contact endpoints."""

    @classmethod
    def list_contacts(cls) -> Tuple[int, Any]:
        contacts = ContactModel.get_all()
        # Seed defaults if completely empty
        if not contacts:
            defaults = [
                {
                    "id": "1",
                    "name": "Bill Gates",
                    "phone": "+1 425 882 8080",
                    "email": "bill.gates@microsoft.com",
                    "company": "Microsoft Corporation",
                    "notes": "Co-founder & Technology Advisor"
                },
                {
                    "id": "2",
                    "name": "Steve Ballmer",
                    "phone": "+1 425 882 8081",
                    "email": "steveb@microsoft.com",
                    "company": "Microsoft Corporation",
                    "notes": "Former Chief Executive Officer"
                },
                {
                    "id": "3",
                    "name": "Satya Nadella",
                    "phone": "+1 425 882 8082",
                    "email": "satyan@microsoft.com",
                    "company": "Microsoft Corporation",
                    "notes": "Chairman and Chief Executive Officer"
                }
            ]
            for d in defaults:
                ContactModel.save(d)
            contacts = ContactModel.get_all()

        return cls.success(contacts)

    @classmethod
    def save_contact(cls, body: Dict[str, Any]) -> Tuple[int, Any]:
        contact_data = body.get("contact", body)
        if not isinstance(contact_data, dict):
            return cls.error("Invalid contact payload")

        saved = ContactModel.save(contact_data)
        all_contacts = ContactModel.get_all()
        return cls.success({"success": True, "contact": saved, "contacts": all_contacts})

    @classmethod
    def delete_contact(cls, body: Dict[str, Any]) -> Tuple[int, Any]:
        contact_id = str(body.get("id") or "")
        if not contact_id:
            return cls.error("Contact ID required")

        ContactModel.delete(contact_id)
        all_contacts = ContactModel.get_all()
        return cls.success({"success": True, "contacts": all_contacts})
