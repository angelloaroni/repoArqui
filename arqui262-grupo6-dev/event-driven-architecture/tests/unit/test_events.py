import pytest
from pydantic import ValidationError

from shared.events import EVENT_TYPE, BookingConfirmedData, BookingConfirmedEvent
from shared.rabbit import SUBSCRIPTIONS


def _event() -> BookingConfirmedEvent:
    data = BookingConfirmedData(booking_id="BK-1001", customer_id="C-100", amount=450.0, currency="USD")
    return BookingConfirmedEvent.new(data, "corr-1")


def test_envelope_has_cloudevents_core_attributes():
    body = _event().model_dump(mode="json")
    assert body["specversion"] == "1.0"
    assert body["type"] == EVENT_TYPE
    assert body["source"] == "/booking-service"
    assert body["subject"] == "booking/BK-1001"
    assert body["correlationid"] == "corr-1"
    assert body["id"] and body["time"]


def test_roundtrip_json():
    event = _event()
    assert BookingConfirmedEvent.model_validate_json(event.model_dump_json()) == event


@pytest.mark.parametrize("missing", ["id", "correlationid", "data", "time"])
def test_missing_required_attribute_is_rejected(missing):
    body = _event().model_dump(mode="json")
    del body[missing]
    with pytest.raises(ValidationError):
        BookingConfirmedEvent.model_validate(body)


def test_wrong_type_or_specversion_is_rejected():
    body = _event().model_dump(mode="json")
    with pytest.raises(ValidationError):
        BookingConfirmedEvent.model_validate({**body, "type": "other.type"})
    with pytest.raises(ValidationError):
        BookingConfirmedEvent.model_validate({**body, "specversion": "0.3"})


def test_negative_amount_is_a_valid_envelope():
    """Poison event design: valid contract, invalid business data."""
    data = BookingConfirmedData(booking_id="BK-1", customer_id="C-1", amount=-10, currency="USD")
    BookingConfirmedEvent.new(data, "corr")


def test_one_queue_per_subscriber():
    queues = {s.queue for s in SUBSCRIPTIONS.values()}
    assert queues == {
        "crm.booking-confirmed.v1",
        "notification.booking-confirmed.v1",
        "analytics.booking-confirmed.v1",
    }
