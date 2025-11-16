import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/sync_provider.dart';

class SyncIndicator extends StatelessWidget {
  const SyncIndicator({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<SyncProvider>(
      builder: (context, syncProvider, child) {
        return Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          decoration: BoxDecoration(
            color: _getBackgroundColor(syncProvider.syncStatus),
            borderRadius: BorderRadius.circular(20),
            boxShadow: [
              BoxShadow(
                color: _getBackgroundColor(syncProvider.syncStatus)
                    .withOpacity(0.3),
                blurRadius: 8,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              _buildStatusIcon(syncProvider),
              const SizedBox(width: 8),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    _getStatusText(syncProvider),
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  if (syncProvider.lastSyncedAt != null)
                    Text(
                      syncProvider.getLastSyncTimeText(),
                      style: TextStyle(
                        color: Colors.white.withOpacity(0.8),
                        fontSize: 10,
                      ),
                    ),
                ],
              ),
              if (syncProvider.syncStatus == SyncStatus.error ||
                  (syncProvider.hasUnsyncedData &&
                      syncProvider.syncStatus != SyncStatus.syncing)) ...[
                const SizedBox(width: 8),
                InkWell(
                  onTap: () => syncProvider.forceSyncNow(),
                  child: Container(
                    padding: const EdgeInsets.all(4),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.2),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Icon(
                      Icons.refresh,
                      color: Colors.white,
                      size: 16,
                    ),
                  ),
                ),
              ],
            ],
          ),
        );
      },
    );
  }

  Widget _buildStatusIcon(SyncProvider syncProvider) {
    switch (syncProvider.syncStatus) {
      case SyncStatus.syncing:
        return const SizedBox(
          width: 16,
          height: 16,
          child: CircularProgressIndicator(
            strokeWidth: 2,
            valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
          ),
        );
      case SyncStatus.success:
        return const Icon(
          Icons.check_circle,
          color: Colors.white,
          size: 16,
        );
      case SyncStatus.error:
        return const Icon(
          Icons.error,
          color: Colors.white,
          size: 16,
        );
      case SyncStatus.idle:
      default:
        if (!syncProvider.isOnline) {
          return const Icon(
            Icons.cloud_off,
            color: Colors.white,
            size: 16,
          );
        }
        if (syncProvider.hasUnsyncedData) {
          return const Icon(
            Icons.cloud_upload,
            color: Colors.white,
            size: 16,
          );
        }
        return const Icon(
          Icons.cloud_done,
          color: Colors.white,
          size: 16,
        );
    }
  }

  String _getStatusText(SyncProvider syncProvider) {
    if (!syncProvider.isOnline) {
      return 'Offline';
    }

    switch (syncProvider.syncStatus) {
      case SyncStatus.syncing:
        return 'Syncing...';
      case SyncStatus.success:
        return 'Synced';
      case SyncStatus.error:
        return 'Sync Failed';
      case SyncStatus.idle:
      default:
        if (syncProvider.hasUnsyncedData) {
          return 'Pending Sync';
        }
        return 'Up to date';
    }
  }

  Color _getBackgroundColor(SyncStatus status) {
    switch (status) {
      case SyncStatus.syncing:
        return Colors.blue;
      case SyncStatus.success:
        return Colors.green;
      case SyncStatus.error:
        return Colors.red;
      case SyncStatus.idle:
      default:
        return Colors.grey.shade700;
    }
  }
}
