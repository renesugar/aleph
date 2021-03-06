import six
import logging
from banal import hash_data
from flask.ext.babel import get_locale
from flask import request, Response, Blueprint

from aleph.core import settings

log = logging.getLogger(__name__)
blueprint = Blueprint('cache', __name__)


class NotModified(Exception):
    """Converts to HTTP status 304."""
    pass


def handle_not_modified(exc):
    return Response(status=304)


@blueprint.before_app_request
def setup_caching():
    """Set some request attributes at the beginning of the request.
    By default, caching will be disabled."""
    locale = get_locale()
    request._app_locale = six.text_type(locale)
    request._http_cache = False
    request._http_private = False
    request._http_etag = None


def enable_cache(vary_user=True, vary=None, server_side=False):
    """Enable caching in the context of a view.

    If desired, instructions on the cache parameters can be included, such as
    if the data is fit for public caches (default: no, vary_user) and what
    values to include in the generation of an etag.
    """
    if not settings.CACHE:
        return

    request._http_cache = True
    args = sorted(set(request.args.items()))
    # jquery where is your god now?!?
    args = filter(lambda (k, v): k != '_', args)
    cache_parts = [args, vary, request._app_locale]

    if vary_user:
        cache_parts.extend((request.authz.roles))
        request._http_private = True

    request._http_etag = hash_data(cache_parts)
    if request.if_none_match == request._http_etag:
        raise NotModified()


@blueprint.after_app_request
def cache_response(resp):
    """Post-request processing to set cache parameters."""
    if resp.is_streamed:
        # http://wiki.nginx.org/X-accel#X-Accel-Buffering
        resp.headers['X-Accel-Buffering'] = 'no'

    if not request._http_cache:
        return resp

    if request.method != 'GET' or resp.status_code != 200:
        return resp

    if request._http_etag:
        resp.set_etag(request._http_etag)

    if request._http_private:
        resp.cache_control.private = True
        resp.expires = -1
    else:
        resp.cache_control.public = True
        resp.cache_control.max_age = 3600 * 12
    return resp
