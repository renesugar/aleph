import six
import logging
from banal import ensure_list

from aleph.model import Role, Event, Events, Notification

log = logging.getLogger(__name__)


def object_id(obj, clazz=None):
    clazz = clazz or type(obj)
    if isinstance(obj, clazz):
        obj = obj.id
    elif isinstance(obj, dict):
        obj = obj.get('id')
    return obj


def channel(obj, clazz=None):
    clazz = clazz or type(obj)
    if clazz in six.string_types:
        return obj

    obj = object_id(obj, clazz=clazz)
    if obj is not None:
        return '%s:%s' % (clazz.__name__, obj)


def publish(event, actor_id=None, params=None, channels=None):
    assert isinstance(event, Event), event
    params = params or {}
    outparams = {}
    channels = ensure_list(channels)
    channels.append(channel(actor_id, clazz=Role))
    for name, clazz in event.params.items():
        obj = params.get(name)
        outparams[name] = object_id(obj, clazz=clazz)
        channels.append(channel(obj, clazz=clazz))
    Notification.publish(event,
                         actor_id=actor_id,
                         params=outparams,
                         channels=channels)
